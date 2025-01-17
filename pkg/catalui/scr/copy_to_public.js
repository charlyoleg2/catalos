#!/usr/bin/env node
// scr/copy_to_public.js
import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function copyFiles(iOrig, iDest) {
	let cntPart = 0;
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
		// list of image format from https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
		const avatars = await glob(
			`${dOrig}/users/*.{svg,png,apng,avif,gif,jpeg,jpg,jfif,pjpeg,pjp,webp}`
		);
		for (const pavatar of avatars) {
			const bname = path.basename(pavatar);
			//console.log(bname);
			//console.log(`copy svg,png,jpg: ${bname}`);
			await fs.copy(`${dOrig}/users/${bname}`, `${dDest}/u/${bname}`);
		}
		// copy parts
		const users = await glob(`${dOrig}/users/*.yaml`);
		for (const iUser of users) {
			const bUser = path.basename(iUser, '.yaml');
			const pUser = `${dOrig}/parts/${bUser}`;
			if (await fs.pathExists(pUser)) {
				if ((await fs.stat(pUser)).isDirectory()) {
					//console.log(`copy dir: ${bUser}`);
					//await fs.copy(pUser, `${dDest}/u/${bUser}`);
					//cntPart += 1;
					const parts = await glob(`${pUser}/*`);
					for (const iPart of parts) {
						const bPart = path.basename(iPart);
						if ((await fs.stat(iPart)).isDirectory()) {
							console.log(`copy dir: ${bPart}`);
							await fs.copy(iPart, `${dDest}/u/${bUser}/${bPart}`);
							cntPart += 1;
						}
					}
				} else {
					console.log(`warn382: ${pUser} is not a directory!`);
				}
			} else {
				console.log(`warn209: the directory ${pUser} doesn't exist!`);
			}
		}
	} catch (err) {
		console.log(`ERR543: Error while copying files to destination ${dDest}`);
		console.log(err);
	}
	console.log(`info139: from ${dOrig} copy_to_public.js has copied ${cntPart} parts to ${dDest}`);
}

const eDBDIR = process.env.DBDIR;
const argv = yargs(hideBin(process.argv))
	.scriptName('copy_to_public.js')
	.usage('Usage: $0 --inDir <dir-path> --outDir <dir-path>')
	.option('inDir', {
		alias: 'i',
		type: 'string',
		description: 'input directory-path for copying parts',
		demandOption: true,
		default: eDBDIR ? eDBDIR : 'd1',
	})
	.option('outDir', {
		alias: 'o',
		type: 'string',
		description: 'output directory-path for copying parts',
		demandOption: true,
		default: './public',
	})
	.strict()
	.parseSync();

copyFiles(argv.inDir, argv.outDir);
