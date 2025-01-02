#!/usr/bin/env node
// scr/update_db.js

import path from 'node:path';
import fs from 'fs-extra'; // both fs and fs-extra methods are defined
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import YAML from 'yaml';

const extValid = [
	'.png',
	'.jpg',
	//'.pxJson',
	//'.paxJson',
	'.json',
	'.dxf',
	'.svg',
	'.stl',
	'.brep',
	'.step',
	'.glb',
	'.3mf',
	// '.txtLog',
	'.txt',
	'.scad',
	//'.jsCad',
	//'.jsManifold',
	'.js',
	//'.pyFreecad',
	'.py',
];

function defaultObj(iOwner) {
	const rObj = {
		description: '',
		tags: [],
		owner: iOwner,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		updateCount: 0,
		visible: true,
		linkToUi: '',
		linkToSrc: '',
		linkToPkg: '',
		linkToCli: '',
		linkToUis: '',
		linkToRepo: '',
		linkOthers: [],
		files: [],
	};
	return rObj;
}

function updateYaml(iObj, notifyUpdate) {
	const rObj = iObj;
	for (const prop of [
		'description',
		'owner',
		'linkToUi',
		'linkToSrc',
		'linkToPkg',
		'linkToCli',
		'linkToUis',
		'linkToRepo',
	]) {
		if (!(prop in rObj)) {
			rObj[prop] = '';
		}
	}
	for (const prop of ['tags', 'linkOthers', 'files']) {
		if (!(prop in rObj)) {
			rObj[prop] = [];
		}
	}
	if (!('createdAt' in rObj)) {
		rObj.createdAt = new Date().toISOString();
	}
	if (!('updateCount' in rObj)) {
		rObj.updateCount = 0;
	}
	if (notifyUpdate) {
		rObj.updatedAt = new Date().toISOString();
		rObj.updateCount = parseInt(rObj.updateCount) + 1;
	}
	return rObj;
}

async function readYaml(fyaml) {
	const stry = await fs.readFile(fyaml, { encoding: 'utf8' });
	const obj1 = YAML.parse(stry);
	const rObj = updateYaml(obj1, false);
	return rObj;
}

async function writeYaml(iObj, fyaml) {
	const stry = YAML.stringify(iObj);
	await fs.writeFile(fyaml, stry);
}

async function compareFiles(iFile1, iFile2) {
	let rDiff = true;
	if (!(await fs.pathExists(iFile2))) {
		return rDiff;
	} else if (!(await fs.stat(iFile2)).isFile()) {
		throw `err288: ${iFile2} exsits but is not a file`;
		return rDiff;
	} else {
		fBuffer1 = fs.readFile(iFile1);
		fBuffer2 = fs.readFile(iFile2);
		const cmp = Buffer.compare(fBuffer1, fBuffer2);
		rDfiff = cmp === 0 ? true : false;
	}
	return rDiff;
}

function findObj(iObj, fName) {
	let rObj = {};
	if ('files' in iObj) {
		for (iFileObj of iObj.files) {
			if ('fileName' in iFileObj && iFileObj.fileName === fName) {
				rObj = iFileObj;
			}
		}
	}
	return rObj;
}

async function oneFile(iFile, iObj, designName, iDest) {
	const fsize = (await fs.stat(iFile)).size;
	const fBasename = path.basename(iFile);
	const fPath = `${designName}/${fBasename}`;
	const File2 = path.join(iDest, fPath);
	let oneUpdated = false;
	if (await compareFiles(iFile, File2)) {
		await fs.copy(iFile, File2);
		oneUpdated = true;
	}
	// TODO refine extension
	const fExtname = path
		.extname(iFile)
		.replace(/^\./, '')
		.replace(/^txt$/, 'txtLog')
		.replace(/^json$/, 'pxJson')
		.replace(/^js$/, 'jsCad')
		.replace(/^py$/, 'pyFreecad');
	const rObj = {
		fileName: path.basename(iFile),
		fileType: fExtname,
		filePath: fPath,
		fileSize: fsize,
		createdAt: '',
		updatedAt: '',
	};
	const oldObj = findObj(iObj);
	for (const ikey of ['createdAt', 'updatedAt']) {
		if (ikey in oldObj) {
			rObj[ikey] = oldObj[ikey];
		} else {
			rObj[ikey] = new Date().toISOString();
		}
	}
	for (const ikey of ['fileName', 'fileType', 'filePath', 'fileSize']) {
		if (ikey in oldObj) {
			if (rObj[ikey] !== oldObj[ikey]) {
				oneUpdated = true;
			}
		} else {
			oneUpdated = true;
		}
	}
	if (oneUpdated) {
		rObj.updatedAt = new Date().toISOString();
	}
	return [rObj, oneUpdated];
}

async function update_one_design(iDir, iDest) {
	const dName = path.basename(iDir);
	const owner = path.basename(iDest);
	const fyaml = `${iDest}/${dName}.yaml`;
	const ddesi = `${iDest}/${dName}`;
	let objDesi = defaultObj(owner);
	if (await fs.pathExists(fyaml)) {
		if ((await fs.stat(fyaml)).isFile()) {
			console.log(`info213: Update design: ${dName}`);
			objDesi = await readYaml(fyaml);
		} else {
			throw `ERR409: ${fyaml} exists but is not a yaml-file!`;
		}
	} else {
		console.log(`info212: Generate new design: ${dName}`);
	}
	await fs.ensureDir(ddesi);
	const lFiles = await glob(`${iDir}/*`);
	const nFiles = [];
	let filesUpdated = false;
	for (const iFile of lFiles) {
		if ((await fs.stat(iFile)).isFile()) {
			const fBasename = path.basename(iFile);
			const fExtname = path.extname(iFile);
			if (extValid.includes(fExtname)) {
				const [objF, oneUpdated] = await oneFile(iFile, objDesi, dName, iDest);
				nFiles.push(objF);
				filesUpdated |= oneUpdated;
			} else {
				console.log(`warn493: ${fBasename} with extension ${fExtname} is ignored!`);
			}
		} else {
			console.log(`warn494: ${iFile} is ignored!`);
		}
	}
	objDesi.files = nFiles;
	if (filesUpdated) {
		rObj.updatedAt = new Date().toISOString();
		rObj.updateCount = parseInt(rObj.updateCount) + 1;
	}
	await writeYaml(objDesi, fyaml);
}

async function inspect_designs(iOrig, iDest) {
	let cntDesi = 0;
	const dOrig = iOrig.replace(/\/$/, '');
	const dDest = iDest.replace(/\/$/, '');
	try {
		const explorePath = `${dOrig}/*`;
		//console.log(`dbg281: explorePath: ${explorePath}`);
		if (!(await fs.pathExists(dOrig))) {
			throw `ERR521: Error, the origin ${dOrig} doesn't exist!`;
		}
		if (!(await fs.stat(dOrig)).isDirectory()) {
			throw `ERR522: Error, the origin ${dOrig} is not a directory!`;
		}
		if (!(await fs.pathExists(dDest))) {
			console.log(`warn121: Warning, ${dDest} doesn't exist and will be created!`);
			await fs.ensureDir(dDest);
		} else if (!(await fs.stat(dDest)).isDirectory()) {
			throw `ERR722: Error, the destination ${dDest} is not a directory!`;
		}
		const lFiles = await glob(explorePath);
		for (const iFile of lFiles) {
			const bFile = path.basename(iFile);
			if ((await fs.stat(iFile)).isDirectory()) {
				//console.log(`generate design: ${bFile}`);
				await update_one_design(iFile, dDest);
				cntDesi += 1;
			} else {
				console.log(`warn382: ${bFile} is not a directory!`);
			}
		}
	} catch (err) {
		console.log('ERR643: Error while generating designs');
		console.log(err);
	}
	console.log(
		`info439: from ${dOrig} update_db.js has created or updated ${cntDesi} designs in ${dDest}`
	);
}

const argv = yargs(hideBin(process.argv))
	.scriptName('update_db.js')
	.usage('Usage: $0 --inDir <dir-path> --outDir <dir-path>')
	.option('inDir', {
		alias: 'i',
		type: 'string',
		description: 'input directory-path for searching designs',
		demandOption: true,
	})
	.option('outDir', {
		alias: 'o',
		type: 'string',
		description: 'output directory-path for creating or updating designs',
		demandOption: true,
	})
	.strict()
	.parseSync();

await inspect_designs(argv.inDir, argv.outDir);
