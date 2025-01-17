// src/lib/sortedParts.ts

import { selectFileVignette, prioImage } from './fileExt.ts';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

function randomSort(iArr: CollectionEntry<'parts'>[]): CollectionEntry<'parts'>[] {
	const rArr = iArr
		.map((val) => ({ val, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ val }) => val);
	return rArr;
}

const partNewest = (await getCollection('parts')).sort(
	(a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime()
);
const partActive = (await getCollection('parts')).sort(
	(a, b) => b.data.updateCount - a.data.updateCount
);
const partDocumented = (await getCollection('parts')).sort(
	(a, b) => b.data.files.length - a.data.files.length
);
const partRandom = randomSort(await getCollection('parts'));

const dSorted = {
	newest: { title: 'The newest parts', parts: partNewest },
	active: { title: 'The most active parts', parts: partActive },
	documented: { title: 'The most documented parts', parts: partDocumented },
	random: { title: 'Random parts', parts: partRandom },
};
type tDSortedKey = keyof typeof dSorted;

function imageList(iPart: CollectionEntry<'parts'>) {
	const rArr = iPart.data.files
		.filter((item) => selectFileVignette(item.fileType))
		.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
		.sort((a, b) => prioImage(b.fileType) - prioImage(a.fileType));
	return rArr;
}

export type { tDSortedKey };
export { dSorted, imageList };
