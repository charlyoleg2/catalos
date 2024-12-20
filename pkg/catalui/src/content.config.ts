// src/content.config.ts

import { defineCollection, reference, z } from 'astro:content';
//import { glob, file } from 'astro/loaders';
import { glob } from 'astro/loaders';
//import { schemaDesign } from './lib/util.ts';

const users = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './d1/users' }),
	schema: z.object({
		userId: z.number(),
		username: z.string(),
		firstName: z.string(),
		familyName: z.string(),
		birthDate: z.date(),
		country: z.string(),
		city: z.string(),
		photoPath: z.string(),
		email: z.string().email(),
		passwd: z.coerce.string(),
		createdAt: z.coerce.date(),
		verifiedAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
		updateCount: z.number(),
		lastLoginAt: z.coerce.date(),
		lastIP: z.string().ip(),
		loginCount: z.number(),
		deletedUserAt: z.coerce.date(),
		deletedAdminAt: z.coerce.date(),
		admin: z.boolean(),
	}),
});

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
const designs = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './d1/designs' }),
	schema: schemaDesign,
});

export const collections = { users, designs };
