#!/usr/bin/env node
// scr/copy_to_public.js
import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function copyFiles(iOrig, iDest) {
	let cntDesi = 0;
	const dOrig = iOrig.replace(/\/$/, '');
	const dDest = iDest.replace(/\/$/, '');
	try {
		// dOrig sanity check
		if (!(await fs.pathExists(dOrig))) {
			throw `ERR521: Error, the origin ${dOrig} doesn't exist!`;
		}
		if (!(await fs.stat(dOrig)).isDirectory()) {
			throw `ERR522: Error, the origin ${dOrig} is not a directory!`;
		}
		// dDest sanity check
		if (!(await fs.pathExists(dDest))) {
			throw `ERR523: Error, the origin ${dDest} doesn't exist!`;
		}
		if (!(await fs.stat(dDest)).isDirectory()) {
			throw `ERR524: Error, the origin ${dDest} is not a directory!`;
		}
		// copy avatars
		//await fs.copy('./d1/users/charlyoleg.svg', './public/u/charlyoleg.svg');
		//await fs.copy('./d1/users/carlo78.svg', './public/u/carlo78.svg');
		const avatars = await glob(`${dOrig}/users/*.{svg,png,jpeg,jpg}`);
		for (const pavatar of avatars) {
			const bname = path.basename(pavatar);
			//console.log(bname);
			//console.log(`copy svg,png,jpg: ${bname}`);
			await fs.copy(`${dOrig}/users/${bname}`, `${dDest}/u/${bname}`);
		}
		// copy designs
		const users = await glob(`${dOrig}/users/*.yaml`);
		for (const iUser of users) {
			const bname = path.basename(iUser, '.yaml');
			const porig = `${dOrig}/designs/${bname}`;
			if (await fs.pathExists(porig)) {
				if ((await fs.stat(porig)).isDirectory()) {
					console.log(`copy dir: ${bname}`);
					await fs.copy(porig, `${dDest}/u/${bname}`);
					cntDesi += 1;
				} else {
					console.log(`warn382: ${porig} is not a directory!`);
				}
			} else {
				console.log(`warn209: the directory ${porig} doesn't exist!`);
			}
		}
	} catch (err) {
		console.log(`ERR543: Error while copying files to destination ${dDest}`);
		console.log(err);
	}
	console.log(
		`info139: from ${dOrig} copy_to_public.js has copied ${cntDesi} designs to ${dDest}`
	);
}

const argv = yargs(hideBin(process.argv))
	.scriptName('copy_to_public.js')
	.usage('Usage: $0 --inDir <dir-path> --outDir <dir-path>')
	.option('inDir', {
		alias: 'i',
		type: 'string',
		description: 'input directory-path for copying designs',
		demandOption: true,
	})
	.option('outDir', {
		alias: 'o',
		type: 'string',
		description: 'output directory-path for copying designs',
		demandOption: true,
		default: './public',
	})
	.strict()
	.parseSync();

copyFiles(argv.inDir, argv.outDir);