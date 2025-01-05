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

async function check_desi(iDesi, bUser2, iUpdate) {
	let cntErr = 0;
	if (!((await fs.pathExists(iDesi)) && (await fs.stat(iDesi)).isFile())) {
		console.log(`err229: ${iDesi} is not a file for user ${bUser2}`);
		cntErr += 1;
	}
	if (iUpdate) {
		cntErr += 1;
	}
	return cntErr;
}

async function check_userDesi(iUser2, userList, iUpdate) {
	let cntDesi = 0;
	let cntErr = 0;
	const bUser2 = path.basename(iUser2);
	if (userList.includes(bUser2)) {
		const uDesis = await glob(`${iUser2}/*.yaml`);
		for (const iDesi of uDesis) {
			cntErr += await check_desi(iDesi, bUser2, iUpdate);
			cntDesi += 1;
		}
	} else {
		console.log(`err211: bUser2 ${bUser2} doesn't have its yaml-user`);
		cntErr += 1;
	}
	return [cntDesi, cntErr];
}

async function check_db(iDBdir, iUpdate) {
	const userList = [];
	let cntErr = 0;
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
		const users = await glob(`${iDBdir}/users/*.yaml`);
		//console.log(`dbg333: iDBdir ${iDBdir}`);
		//console.log(users);
		for (const iUser of users) {
			const [bUser, userErr] = await check_user(iUser);
			userList.push(bUser);
			cntErr += userErr;
		}
		// check designs
		const dUser = await glob(`${iDBdir}/designs/*`);
		for (const iUser2 of dUser) {
			if ((await fs.stat(iUser2)).isDirectory()) {
				const [tCntDesi, tCntErr] = await check_userDesi(iUser2, userList, iUpdate);
				cntErr += tCntErr;
				cntDesi += tCntDesi;
			} else {
				console.log(`err721: ${iUser2} is not a directory`);
				cntErr += 1;
			}
		}
		// check missing userDesign
		for (const user of userList) {
			const pUserDesi = path.join(iDBdir, 'designs', user);
			if (!(await fs.pathExists(pUserDesi))) {
				console.log(`err722: ${pUserDesi} doesn't exist for user ${user}`);
				cntErr += 1;
			}
		}
	} catch (err) {
		console.log(`ERR670: Error while checking iDBdir ${iDBdir}`);
		console.log(err);
	}
	console.log(
		`info610: check_d1.js with iUpdate ${iUpdate} has found ${userList.length} users and ${cntDesi} designs in ${iDBdir} with ${cntErr} errors`
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
