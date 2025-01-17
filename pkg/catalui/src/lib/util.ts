// src/lib/util.ts

interface tOnePart {
	user: string;
	partName: string;
}

function prefixBase(iPath: string): string {
	const base = import.meta.env.BASE_URL;
	const base2 = base === '/' ? '' : base;
	const rPath = `${base2}${iPath}`;
	return rPath;
}

function prunePrefix(iPart: string): string {
	const rDname = iPart.replace(/^.*\//, '');
	return rDname;
}

function splitPartPath(iPart: string): tOnePart {
	let rUser = 'oops';
	let rPart = 'oops';
	const words = iPart.split('/');
	if (words.length === 2) {
		rUser = words[0];
		rPart = words[1];
	}
	const rObj: tOnePart = { user: rUser, part: rPart };
	return rObj;
}

export type { tOnePart };
export { prefixBase, prunePrefix, splitPartPath };
