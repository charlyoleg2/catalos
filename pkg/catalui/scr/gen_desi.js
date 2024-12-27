#!/usr/bin/env node
// scr/gen_desi.js

import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function genDesigns(iOrig, iDest) {
	let cntDesi = 0;
	const dOrig = iOrig.replace(/\/$/, '');
	const dDest = iDest.replace(/\/$/, '');
	try {
		const explorePath = `${dOrig}/*`;
		console.log(`dbg281: explorePath: ${explorePath}`);
		if (!(await fs.pathExists(dOrig))) {
			throw `ERR521: Error, the origin ${dOrig} doesn't exist!`;
		}
		if (!(await fs.stat(dOrig)).isDirectory()) {
			throw `ERR522: Error, the origin ${dOrig} is not a directory!`;
		}
		if (!(await fs.pathExists(dDest))) {
			console.log(`warn121: Warning, the destination directory ${dDest} doesn't exist and will be created!`);
		} else if (!(await fs.stat(dDest)).isDirectory()) {
			throw `ERR722: Error, the destination ${dDest} is not a directory!`;
		}
		const lFiles = await glob(explorePath);
		for (const iFile of lFiles) {
			const bFile = path.basename(iFile);
			if ((await fs.stat(iFile)).isDirectory()) {
				console.log(`generate design: ${bFile}`);
				//await fs.copy(porig, `./public/u/${bname}`);
				cntDesi += 1;
			} else {
				console.log(`warn382: ${bFile} is not a directory!`);
			}
		}
	} catch (err) {
		console.log('ERR643: Error while generating designs');
		console.log(err);
	}
	console.log(`info439: from ${dOrig} gen_desi.js has created or updated ${cntDesi} designs in ${dDest}`);
}

const argv = yargs(hideBin(process.argv))
	.scriptName('gen_desi.js')
	.usage('Usage: $0 --inDir <dir-path> --outDir <dir-path>')
	.option('inDir', {
		alias: 'i',
		type: 'string',
		description: 'input directory-path for searching designs',
		demandOption: true
	})
	.option('outDir', {
		alias: 'o',
		type: 'string',
		description: 'output directory-path for creating or updating designs',
		demandOption: true
	})
	.strict()
	.parseSync();

await genDesigns(argv.inDir, argv.outDir);
