// src/lib/sortedDesigns.ts

import { selectFileVignette, prioImage } from './fileExt.ts';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

function randomSort(iArr: CollectionEntry<'designs'>[]): CollectionEntry<'designs'>[] {
	const rArr = iArr
		.map((val) => ({ val, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ val }) => val);
	return rArr;
}

const desiNewest = (await getCollection('designs')).sort(
	(a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime()
);
const desiActive = (await getCollection('designs')).sort(
	(a, b) => b.data.updateCount - a.data.updateCount
);
const desiDocumented = (await getCollection('designs')).sort(
	(a, b) => b.data.files.length - a.data.files.length
);
const desiRandom = randomSort(await getCollection('designs'));

const dSorted = {
	newest: { title: 'The newest designs', designs: desiNewest },
	active: { title: 'The most active designs', designs: desiActive },
	documented: { title: 'The most documented designs', designs: desiDocumented },
	random: { title: 'Random designs', designs: desiRandom },
};
type tDSortedKey = keyof typeof dSorted;

function imageList(iDesign: CollectionEntry<'designs'>) {
	const rArr = iDesign.data.files
		.filter((item) => selectFileVignette(item.fileType))
		.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
		.sort((a, b) => prioImage(b.fileType) - prioImage(a.fileType));
	return rArr;
}

export type { tDSortedKey };
export { dSorted, imageList };
