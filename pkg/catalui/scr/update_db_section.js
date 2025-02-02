#!/usr/bin/env node
// scr/update_db_section.js

import path from 'node:path';
import fs from 'fs-extra'; // both fs and fs-extra methods are defined
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import YAML from 'yaml';

const imageExt = ['png', 'apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjepg', 'pjp', 'webp'];
const extValid = [
	//'.image'
	'.png',
	'.apng',
	'.avif',
	'.gif',
	'.jpg',
	'.jpeg',
	'.jfif',
	'.pjpeg',
	'.pjp',
	'.webp',
	//'.pxJson',
	//'.paxJson',
	'.json',
	'.dxf',
	'.svg',
	'.stl',
	'.brep',
	'.step',
	'.stp',
	'.iges',
	'.igs',
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
		throw `ERR288: ${iFile2} exsits but is not a file`;
		//return rDiff;
	} else {
		// TODO: improve memory usage with readStream
		const fBuffer1 = await fs.readFile(iFile1);
		const fBuffer2 = await fs.readFile(iFile2);
		const cmp = Buffer.compare(fBuffer1, fBuffer2);
		rDiff = cmp === 0 ? false : true;
		//if (cmp !== 0) {
		//	console.log(`dbg789: ${iFile1} ${iFile2} differ! cmp: ${cmp}`);
		//}
	}
	return rDiff;
}

function getExtname(iFile) {
	// TODO refine extension
	const fBasename = path.basename(iFile);
	let rExtname = path
		.extname(iFile)
		.replace(/^\./, '')
		.replace(/^txt$/, 'txtLog')
		//.replace(/^json$/, 'pxJson')
		.replace(/^js$/, 'jsCad')
		.replace(/^py$/, 'pyFreecad');
	if (imageExt.includes(rExtname)) {
		rExtname = 'image';
	}
	if (rExtname === 'json') {
		if (/^px_/.test(fBasename)) {
			rExtname = 'pxJson';
		} else {
			rExtname = 'paxJson';
		}
	}
	return rExtname;
}

function findObj(iObj, fName) {
	let rObj = {};
	if ('files' in iObj) {
		for (const iFileObj of iObj.files) {
			if ('fileName' in iFileObj && iFileObj.fileName === fName) {
				rObj = structuredClone(iFileObj);
			}
		}
	}
	return rObj;
}

async function oneFile(iFile, iObj, partName, iDest) {
	const fsize = (await fs.stat(iFile)).size;
	const fBasename = path.basename(iFile);
	const fPath = `${partName}/${fBasename}`;
	const File2 = path.join(iDest, fPath);
	let oneUpdated = false;
	if (await compareFiles(iFile, File2)) {
		await fs.copy(iFile, File2);
		// oneUpdated commented because assume d1 is without part-files
		// fileSize is the remaining hint for tracking changes
		//oneUpdated = true;
	}
	const rObj = {
		fileName: fBasename,
		fileType: getExtname(iFile),
		filePath: fPath,
		fileSize: fsize,
		createdAt: '',
		updatedAt: '',
	};
	const oldObj = findObj(iObj, fBasename);
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
				//console.log(`dbg323: key ${ikey} : ${rObj[ikey]} : ${oldObj[ikey]}`);
			}
		} else {
			oneUpdated = true;
			//console.log(`dbg324: key ${ikey}`);
		}
	}
	if (oneUpdated) {
		rObj.updatedAt = new Date().toISOString();
	}
	return [rObj, oneUpdated];
}

async function chooseFiles(nFiles, objPart, dpart, dName, iCleanNonExistingFiles) {
	const rFiles = [];
	const lNewFiles = [];
	for (const iFileObj of nFiles) {
		if ('fileName' in iFileObj) {
			lNewFiles.push(iFileObj.fileName);
		}
	}
	const lExtraFiles = [];
	if ('files' in objPart) {
		for (const iFileObj of objPart.files) {
			if ('fileName' in iFileObj && !lNewFiles.includes(iFileObj.fileName)) {
				lExtraFiles.push(iFileObj.fileName);
			}
		}
	}
	// add old Files if they exists or no-clean-flag
	for (const fName of lExtraFiles) {
		let keepFile = false;
		const fPath = path.join(dpart, fName);
		if (await fs.pathExists(fPath)) {
			if ((await fs.stat(fPath)).isFile()) {
				keepFile = true;
			}
		}
		if (!keepFile && iCleanNonExistingFiles) {
			console.log(`info224: part ${dName} removes non-existing file ${fName}`);
		}
		if (keepFile || !iCleanNonExistingFiles) {
			//console.log(`dbg342: keep old file: ${fName}`);
			rFiles.push(findObj(objPart, fName));
		}
	}
	// add new Files
	for (const iFileObj of nFiles) {
		//console.log(`dbg343: keep new file: ${iFileObj.fileName}`);
		rFiles.push(structuredClone(iFileObj));
	}
	return rFiles;
}

async function update_one_part(iDir, iDest, iCleanNonExistingFiles) {
	const dNameUc = path.basename(iDir);
	// lower-case part-name because Astro lower-case collections
	const dName = dNameUc.toLowerCase();
	const owner = path.basename(iDest);
	if (dName !== dNameUc) {
		console.log(`warn912: dName ${dNameUc} > ${dName} renamed for lower-case!`);
	}
	if (owner !== owner.toLowerCase()) {
		throw `ERR913: owner ${owner} contains upper-case!`;
	}
	const fyaml = `${iDest}/${dName}.yaml`;
	const dpart = `${iDest}/${dName}`;
	let objPart = defaultObj(owner);
	if (await fs.pathExists(fyaml)) {
		if ((await fs.stat(fyaml)).isFile()) {
			console.log(`info213: Update part: ${dName}`);
			objPart = await readYaml(fyaml);
		} else {
			throw `ERR409: ${fyaml} exists but is not a yaml-file!`;
		}
	} else {
		console.log(`info212: Generate new part: ${dName}`);
	}
	await fs.ensureDir(dpart);
	const lFiles = await glob(`${iDir}/*`);
	const nFiles = [];
	let filesUpdated = false;
	for (const iFile of lFiles) {
		if ((await fs.stat(iFile)).isFile()) {
			const fBasename = path.basename(iFile);
			const fExtname = path.extname(iFile);
			if (extValid.includes(fExtname)) {
				const [objF, oneUpdated] = await oneFile(iFile, objPart, dName, iDest);
				nFiles.push(objF);
				filesUpdated |= oneUpdated;
			} else if (['.exampleExtWarn'].includes(fExtname)) {
				console.log(`warn493: ${fBasename} with extension ${fExtname} is ignored!`);
			} else {
				throw `ERR393: ${fBasename} with extension unknown ${fExtname}`;
			}
		} else {
			console.log(`warn494: ${iFile} is ignored!`);
		}
	}
	objPart.files = await chooseFiles(nFiles, objPart, dpart, dName, iCleanNonExistingFiles);
	if (filesUpdated) {
		objPart.updatedAt = new Date().toISOString();
		objPart.updateCount = parseInt(objPart.updateCount) + 1;
	}
	await writeYaml(objPart, fyaml);
}

async function inspect_parts(iOrig, iDest, iCleanNonExistingFiles) {
	let cntPart = 0;
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
				//console.log(`generate part: ${bFile}`);
				await update_one_part(iFile, dDest, iCleanNonExistingFiles);
				cntPart += 1;
			} else {
				console.log(`warn382: ${bFile} is not a directory!`);
			}
		}
	} catch (err) {
		console.log('ERR643: Error while generating parts');
		console.log(err);
		process.exit(1);
	}
	console.log(
		`info439: from ${dOrig} update_db_section.js has created or updated ${cntPart} parts in ${dDest}`
	);
}

const argv = yargs(hideBin(process.argv))
	.scriptName('update_db_section.js')
	.usage('Usage: $0 --inDir <dir-path> --outDir <dir-path>')
	.option('inDir', {
		alias: 'i',
		type: 'string',
		description: 'input directory-path for searching parts',
		demandOption: true,
	})
	.option('outDir', {
		alias: 'o',
		type: 'string',
		description: 'output directory-path for creating or updating parts',
		demandOption: true,
	})
	.option('cleanNonExistingFiles', {
		alias: 'c',
		type: 'boolean',
		description: 'clean the file-list of the non-existing files',
		demandOption: true,
		default: true,
	})
	.strict()
	.parseSync();

await inspect_parts(argv.inDir, argv.outDir, argv.cleanNonExistingFiles);
