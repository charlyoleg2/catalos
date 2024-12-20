#!/usr/bin/env node
// copy_d1_files.js
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
			console.log(bname);
			await fs.copy(`./d1/users/${bname}`, `./public/u/${bname}`);
		}
	} catch (err) {
		console.log('ERR543: Error while copying files to public');
		console.log(err);
	}
}

copyFiles();
