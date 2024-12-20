// src/lib/util.ts

const base = import.meta.env.BASE_URL;

function prefixBase(iPath: string): string {
	const base2 = base === '/' ? '' : base;
	const rPath = `${base2}${iPath}`;
	return rPath;
}

export { prefixBase };
