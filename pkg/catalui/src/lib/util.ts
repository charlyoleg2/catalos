// src/lib/util.ts

interface tOneDesi {
	user: string;
	design: string;
}

function prefixBase(iPath: string): string {
	const base = import.meta.env.BASE_URL;
	const base2 = base === '/' ? '' : base;
	const rPath = `${base2}${iPath}`;
	return rPath;
}

function prunePrefix(iDesi: string): string {
	const rDname = iDesi.replace(/^.*\//, '');
	return rDname;
}

function splitDesiPath(iDesi: string): tOneDesi {
	let rUser = 'oops';
	let rDesign = 'oops';
	const words = iDesi.split('/');
	if (words.length === 2) {
		rUser = words[0];
		rDesign = words[1];
	}
	const rObj: tOneDesi = { user: rUser, design: rDesign };
	return rObj;
}

export type { tOneDesi };
export { prefixBase, prunePrefix, splitDesiPath };
