#!/usr/bin/env node
// catal-uis.ts

import { feli_cli } from 'feli';
import process from 'node:process';
import path from 'node:path';

const scrDir = import.meta.dirname;
const defaultPublicDir = path.join(scrDir, 'public');

//console.log('catal-uis.ts says Hello!');
try {
	await feli_cli(defaultPublicDir, process.argv);
} catch (err) {
	console.error(`Error from feli: ${err}`);
}
//console.log('catal-uis.ts says Bye!');
