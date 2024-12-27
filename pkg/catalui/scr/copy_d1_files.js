#!/usr/bin/env node
// scr/copy_d1_files.js
import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';

async function copyFiles() {
	try {
		//await fs.copy('./d1/users/charlyoleg.svg', './public/u/charlyoleg.svg');
		//await fs.copy('./d1/users/carlo78.svg', './public/u/carlo78.svg');
		const avatars = await glob('./d1/users/*.{svg,png,jpeg,jpg}');
		for (const pavatar of avatars) {
			const bname = path.basename(pavatar);
			//console.log(bname);
			//console.log(`copy svg,png,jpg: ${bname}`);
			await fs.copy(`./d1/users/${bname}`, `./public/u/${bname}`);
		}
		const users = await glob('./d1/users/*.yaml');
		for (const iUser of users) {
			const bname = path.basename(iUser, '.yaml');
			const porig = `./d1/designs/${bname}`;
			if (await fs.pathExists(porig)) {
				if ((await fs.stat(porig)).isDirectory()) {
					console.log(`copy dir: ${bname}`);
					await fs.copy(porig, `./public/u/${bname}`);
				} else {
					console.log(`warn382: ${porig} is not a directory!`);
				}
			} else {
				console.log(`warn209: the directory ${porig} doesn't exist!`);
			}
		}
	} catch (err) {
		console.log('ERR543: Error while copying files to public');
		console.log(err);
	}
}

copyFiles();
