// src/lib/util.ts

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

export { prefixBase, prunePrefix };
