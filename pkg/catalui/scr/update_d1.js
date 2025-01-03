#!/usr/bin/env node
// scr/update_d1.js

import path from 'node:path';
import { chdir } from 'node:process';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

// change working directory
const scrDir = import.meta.dirname;
chdir(path.join(scrDir, '..'));

// exec command in shell
const aExec = promisify(exec);
async function execCmd(cmd) {
	console.log(cmd);
	try {
		const { stdout, stderr } = await aExec(cmd);
		console.log('---> stdout:');
		console.log(stdout);
		console.log('---> stderr:');
		console.log(stderr);
		console.log('---> end of log');
	} catch (err) {
		console.log(`err895: Error by executing: ${cmd}`);
		console.log(err);
		console.log(`info895: script stopped!`);
		process.exit(1);
	}
}

async function degit_and_update(iURL, iUser, iDB) {
	const onedir = path.basename(iURL);
	console.log(`degit_and_update: ${onedir}`);
	await execCmd(`rm -fr tmp/${onedir}`);
	await execCmd(`npx degit ${iURL} tmp/${onedir}`);
	await execCmd(
		`node scr/update_db.js --inDir tmp/${onedir}/refs --outDir ${iDB}/designs/${iUser}`
	);
}

// get environment variable
const eCATALDB = process.env.CATALDB;

if (eCATALDB === '2') {
	console.log('update_d1.js says Hello with CATALDB=2!');
	await degit_and_update('https://github.com/charlyoleg2/gears_and_springs', 'tuto-2', 'd2');
	console.log('update_d1.js says Bye with CATALDB=2!');
} else {
	console.log('update_d1.js says Hello with CATALDB=1!');
	await degit_and_update('https://github.com/charlyoleg2/ustensile', 'tuto-1', 'db1');
	await degit_and_update('https://github.com/charlyoleg2/gears_and_springs', 'tuto-2', 'db1');
	console.log('update_d1.js says Bye with CATALDB=1!');
}
