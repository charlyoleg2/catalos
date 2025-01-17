#!/usr/bin/env node
// scr/check_d1.js

import { exit } from 'node:process';
import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import YAML from 'yaml';

const imageExt = ['png', 'apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjepg', 'pjp', 'webp'];

async function readYaml(fyaml) {
	const stry = await fs.readFile(fyaml, { encoding: 'utf8' });
	const rObj = YAML.parse(stry);
	return rObj;
}

async function check_user(iUser) {
	const rUser = path.basename(iUser, '.yaml');
	let cntErr = 0;
	if (rUser !== rUser.toLowerCase()) {
		console.log(`err196: username ${rUser} contains upper-case`);
		cntErr += 1;
	}
	const objUser = await readYaml(iUser);
	const userDir = path.dirname(iUser);
	if ('photoPath' in objUser) {
		const pPhoto = path.join(userDir, objUser.photoPath);
		if (!((await fs.pathExists(pPhoto)) && (await fs.stat(pPhoto)).isFile())) {
			console.log(`err829: file ${objUser.photoPath} doesn't exist for user ${rUser}`);
			cntErr += 1;
		}
	} else {
		console.log(`err828: field 'photoPath' doesn't exist for user ${rUser}`);
		cntErr += 1;
	}
	const avatars = await glob(
		`${userDir}/${rUser}.{svg,png,apng,avif,gif,jpeg,jpg,jfif,pjpeg,pjp,webp}`
	);
	if (avatars.length > 1) {
		console.log(`err827: ${avatars.length} avatars for user ${rUser}`);
		cntErr += 1;
	}
	for (const iField of ['country', 'city', 'createdAt']) {
		if (!(iField in objUser)) {
			console.log(`err826: field ${iField} is missing for user ${rUser}`);
			cntErr += 1;
		}
	}
	return [rUser, cntErr];
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

async function check_partFile(objFile, partDir, iUpdate, partName, bUser2) {
	let cntErr = 0;
	for (const iField of [
		'fileName',
		'fileType',
		'filePath',
		'fileSize',
		'createdAt',
		'updatedAt',
	]) {
		if (!(iField in objFile)) {
			console.log(
				`err520: field ${iField} is missing for part ${partName} of user ${bUser2}`
			);
			cntErr += 1;
		}
	}
	// if all fields exists
	if (cntErr === 0) {
		const pFile = path.join(partDir, '..', objFile.filePath);
		if (!((await fs.pathExists(pFile)) && (await fs.stat(pFile)).isFile())) {
			console.log(
				`err521: file ${pFile} doesn't exist for part ${partName} of user ${bUser2}`
			);
			cntErr += 1;
		} else {
			const fsize = (await fs.stat(pFile)).size;
			if (fsize !== objFile.fileSize) {
				console.log(
					`err525: fileSize ${fsize} versus ${objFile.fileSize} for part ${partName} of user ${bUser2}`
				);
				cntErr += 1;
				if (iUpdate) {
					console.log(
						`info681: update fileSize from ${objFile.fileSize} to ${fsize} for ${pFile}`
					);
					objFile.fileSize = fsize;
				} else {
					cntErr += 1;
				}
			}
		}
		if (path.basename(objFile.filePath) !== objFile.fileName) {
			console.log(
				`err522: filePath ${objFile.filePath} mismatches fileName ${objFile.fileName} for part ${partName} of user ${bUser2}`
			);
			cntErr += 1;
		}
		if (path.dirname(objFile.filePath) !== partName) {
			console.log(
				`err523: filePath ${objFile.filePath} directory doesn't fit for part ${partName} of user ${bUser2}`
			);
			cntErr += 1;
		}
		const expectedExt = getExtname(objFile.filePath);
		if (expectedExt !== objFile.fileType) {
			console.log(
				`err524: fileType ${objFile.fileType} mismatches ${expectedExt} for ${objFile.filePath} of part ${partName} of user ${bUser2}`
			);
			cntErr += 1;
		}
	}
	return cntErr;
}

async function check_part(iPart, bUser2, iUpdate) {
	let cntErr = 0;
	if (!((await fs.pathExists(iPart)) && (await fs.stat(iPart)).isFile())) {
		console.log(`err229: ${iPart} is not a file for user ${bUser2}`);
		cntErr += 1;
	}
	const partParent = path.dirname(iPart);
	const partName = path.basename(iPart, '.yaml');
	if (partName !== partName.toLowerCase()) {
		console.log(`err396: partName ${partName} contains upper-case`);
		cntErr += 1;
	}
	const partDir = path.join(partParent, partName);
	if (!((await fs.pathExists(partDir)) && (await fs.stat(partDir)).isDirectory())) {
		console.log(`err228: partDir ${partDir} doesn't exist or not a directory`);
		cntErr += 1;
		if (iUpdate) {
			console.log(`info061: create directory ${partDir}`);
			await fs.ensureDir(partDir);
		}
	}
	const objPart = await readYaml(iPart);
	for (const iField of [
		'description',
		'tags',
		'owner',
		'createdAt',
		'updatedAt',
		'updateCount',
		'visible',
		'linkToUi',
		'linkToSrc',
		'linkToPkg',
		'linkToCli',
		'linkToUis',
		'linkToRepo',
		'linkOthers',
	]) {
		if (!(iField in objPart)) {
			console.log(
				`err326: field ${iField} is missing for part ${partName} of user ${bUser2}`
			);
			cntErr += 1;
		}
	}
	if ('owner' in objPart && objPart.owner !== bUser2) {
		console.log(
			`err730: owner ${objPart.owner} mismatches ${bUser2} for part ${partName} of user ${bUser2}`
		);
		cntErr += 1;
	}
	const partFiles = await glob(`${partDir}/*`);
	if ('files' in objPart && objPart.files.length !== partFiles.length) {
		console.log(
			`err731: files.length ${objPart.files.length} mismatches ${partFiles.length} for part ${partName} of user ${bUser2}`
		);
		cntErr += 1;
	}
	for (const objFile of objPart.files) {
		cntErr += await check_partFile(objFile, partDir, iUpdate, partName, bUser2);
	}
	return cntErr;
}

async function check_userPart(iUser2, userList, iUpdate) {
	let cntPart = 0;
	let cntErr = 0;
	const bUser2 = path.basename(iUser2);
	if (userList.includes(bUser2)) {
		const uParts = await glob(`${iUser2}/*.yaml`);
		for (const iPart of uParts) {
			cntErr += await check_part(iPart, bUser2, iUpdate);
			cntPart += 1;
		}
	} else {
		console.log(`err211: bUser2 ${bUser2} doesn't have its yaml-user`);
		cntErr += 1;
	}
	return [cntPart, cntErr];
}

async function check_db(iDBdir, iUpdate, noExitCode) {
	const userList = [];
	let cntErr = 0;
	let cntPart = 0;
	try {
		// sanity basic check
		if (!(await fs.pathExists(iDBdir))) {
			throw `ERR161: Error, the iDBdir ${iDBdir} doesn't exist!`;
		}
		if (!(await fs.stat(iDBdir)).isDirectory()) {
			throw `ERR162: Error, the iDBdir ${iDBdir} is not a directory!`;
		}
		// check users
		const users = await glob(`${iDBdir}/users/*.yaml`);
		//console.log(`dbg333: iDBdir ${iDBdir}`);
		//console.log(users);
		for (const iUser of users) {
			const [bUser, userErr] = await check_user(iUser);
			userList.push(bUser);
			cntErr += userErr;
		}
		// check parts
		const dUser = await glob(`${iDBdir}/parts/*`);
		for (const iUser2 of dUser) {
			if ((await fs.stat(iUser2)).isDirectory()) {
				const [tCntPart, tCntErr] = await check_userPart(iUser2, userList, iUpdate);
				cntErr += tCntErr;
				cntPart += tCntPart;
			} else {
				console.log(`err721: ${iUser2} is not a directory`);
				cntErr += 1;
			}
		}
		// check missing userPart
		for (const user of userList) {
			const pUserPart = path.join(iDBdir, 'parts', user);
			if (!(await fs.pathExists(pUserPart))) {
				console.log(`err722: ${pUserPart} doesn't exist for user ${user}`);
				cntErr += 1;
			}
		}
	} catch (err) {
		console.log(`ERR670: Error while checking iDBdir ${iDBdir}`);
		console.log(err);
	}
	console.log(
		`info610: check_d1.js with iUpdate ${iUpdate} has found ${userList.length} users and ${cntPart} parts in ${iDBdir} with ${cntErr} errors`
	);
	if (cntErr > 0) {
		console.log(`err123: check_d1.js founds ${cntErr} errors in ${iDBdir}`);
		if (!noExitCode) {
			exit(1);
		}
	}
}

const eDBDIR = process.env.DBDIR;
const argv = yargs(hideBin(process.argv))
	.scriptName('check_d1.js')
	.usage('Usage: $0 --dbDir <dir-path>')
	.option('dbDir', {
		alias: 'd',
		type: 'string',
		description: 'directory-path for the data-DB',
		demandOption: true,
		default: eDBDIR ? eDBDIR : 'd1',
	})
	.option('update', {
		alias: 'u',
		type: 'boolean',
		description: 'update the part.yaml according to the existing files',
		demandOption: true,
		default: false,
	})
	.option('noExitCode', {
		alias: 'n',
		type: 'boolean',
		description: 'Exit-code 0 even if errors occur. Useful not to stop the CI',
		demandOption: true,
		default: false,
	})
	.strict()
	.parseSync();

check_db(argv.dbDir, argv.update, argv.noExitCode);
