#!/usr/bin/env node
// scr/check_d1.js

import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import YAML from 'yaml';

async function readYaml(fyaml) {
	const stry = await fs.readFile(fyaml, { encoding: 'utf8' });
	const rObj = YAML.parse(stry);
	return rObj;
}

async function check_user(iUser) {
	const rUser = path.basename(iUser, '.yaml');
	let cntErr = 0;
	objUser = await readYaml(iUser);
	userDir = path.dirname(iUser);
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
	for (const field in ['country', 'city', 'createdAt']) {
		if (!(iField in objUser)) {
			console.log(`err826: field ${iField} is missing for user ${rUser}`);
			cntErr += 1;
		}
	}
	return [rUser, cntErr];
}

async function check_db(iDBdir, iUpdate) {
	let cntErr = 0;
	let userList = [];
	let cntDesi = 0;
	try {
		// sanity basic check
		if (!(await fs.pathExists(iDBdir))) {
			throw `ERR161: Error, the iDBdir ${iDBdir} doesn't exist!`;
		}
		if (!(await fs.stat(iDBdir)).isDirectory()) {
			throw `ERR162: Error, the iDBdir ${iDBdir} is not a directory!`;
		}
		// check users
		const avatars = await glob(
			`${iDBdir}/users/*.{svg,png,apng,avif,gif,jpeg,jpg,jfif,pjpeg,pjp,webp}`
		);
		const users = await glob(`${iDBdir}/users/*.{yaml}`);
		for (const iUser of users) {
			const [bUser, userErr] = userList.push(await check_user(iUser, avatars));
			userList.push(bUser);
			cntErr += userErr;
		}
		// check designs
		//const users = await glob(`${dOrig}/users/*.yaml`);
		//for (const iUser of users) {
		//	const bUser = path.basename(iUser, '.yaml');
		//	const pUser = `${dOrig}/designs/${bUser}`;
		//	if (await fs.pathExists(pUser)) {
		//		if ((await fs.stat(pUser)).isDirectory()) {
		//			//console.log(`copy dir: ${bUser}`);
		//			//await fs.copy(pUser, `${dDest}/u/${bUser}`);
		//			//cntDesi += 1;
		//			const desis = await glob(`${pUser}/*`);
		//			for (const iDesi of desis) {
		//				const bDesi = path.basename(iDesi);
		//				if ((await fs.stat(iDesi)).isDirectory()) {
		//					console.log(`copy dir: ${bDesi}`);
		//					await fs.copy(iDesi, `${dDest}/u/${bUser}/${bDesi}`);
		//					cntDesi += 1;
		//				}
		//			}
		//		} else {
		//			console.log(`warn382: ${pUser} is not a directory!`);
		//		}
		//	} else {
		//		console.log(`warn209: the directory ${pUser} doesn't exist!`);
		//	}
		//}
	} catch (err) {
		console.log(`ERR670: Error while checking iDBdir ${iDBdir}`);
		console.log(err);
	}
	console.log(
		`info610: check_d1.js has found ${userList.length} users and ${cntDesi} designs in ${iDBdir} with ${cntErr} errors`
	);
	if (cntErr > 0) {
		console.log(`err123: check_d1.js founds ${cntErr} errors in ${iDBdir}`);
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
		description: 'update the design.yaml according to the existing files',
		demandOption: true,
		default: false,
	})
	.strict()
	.parseSync();

check_db(argv.dbDir, argv.update);
