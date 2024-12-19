#!/usr/bin/env node
// copy_d1_files.js
import fs from 'fs-extra';

async function copyFiles() {
	try {
		await fs.copy('./d1/users/charlyoleg.svg', './public/u/charlyoleg.svg');
		await fs.copy('./d1/users/carlo78.svg', './public/u/carlo78.svg');
	} catch (err) {
		console.log('ERR543: Error while copying files to public');
		console.log(err);
	}
}

copyFiles();
