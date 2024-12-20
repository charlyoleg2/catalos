// src/lib/util.ts
import { z } from 'astro:content';

const base = import.meta.env.BASE_URL;

function prefixBase(iPath: string): string {
	const base2 = base === '/' ? '' : base;
	const rPath = `${base2}${iPath}`;
	return rPath;
}

const listSuffix = [
	'png',
	'jpg',
	'pxJson',
	'paxJson',
	'dxf',
	'svg',
	'stl',
	'brep',
	'step',
	'glb',
	'3mf',
	'txtLog',
	'scad',
	'jsCad',
	'jsManifold',
	'pyFreecad',
];

const schemaDesign = z.object({
	designId: z.number(),
	designName: z.string(),
	description: z.string(),
	owner: reference('users'),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	updateCount: z.number(),
	visitedAt: z.coerce.date(),
	visitCount: z.number(),
	deletedAt: z.coerce.date(),
	visible: z.boolean(),
	likeCount: z.number(),
	likeLastUsers: z.string().array().max(3),
	linkToUi: z.string().url(),
	linkToSrc: z.string().url(),
	linkToPkg: z.string().url(),
	linkToCli: z.string().url(),
	linkToUis: z.string().url(),
	linkToRepo: z.string().url(),
	linkOthers: z.string().url().array(),
	files: z.array(
		z.object({
			fileName: z.string(),
			fileType: z.enum(listSuffix),
			filePath: z.string(),
			fileSize: z.number(),
			createdAt: z.coerce.date(),
			updatedAt: z.coerce.date(),
			updateCount: z.number(),
			downloadedAt: z.coerce.date(),
			downloadCount: z.number(),
			deletedAt: z.coerce.date(),
		})
	),
});

export { prefixBase, schemaDesign };
