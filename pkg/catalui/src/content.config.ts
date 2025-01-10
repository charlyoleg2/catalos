// src/content.config.ts

import { defineCollection, reference, z } from 'astro:content';
//import { glob, file } from 'astro/loaders';
import { glob } from 'astro/loaders';
import { DBDIR } from 'astro:env/server';

const users = defineCollection({
	loader: glob({ pattern: '*.yaml', base: `${DBDIR}/users` }),
	schema: z.object({
		userId: z.number().optional(),
		username: z.string().optional(), // already in the object-filename
		firstName: z.string().optional(),
		familyName: z.string().optional(),
		birthDate: z.date().optional(),
		country: z.string(),
		city: z.string(),
		photoPath: z.string(),
		email: z.string().email().optional(),
		passwd: z.coerce.string().optional(),
		createdAt: z.coerce.date(),
		verifiedAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		updateCount: z.number().optional(),
		lastLoginAt: z.coerce.date().optional(),
		lastIP: z.string().ip().optional(),
		loginCount: z.number().optional(),
		deletedUserAt: z.coerce.date().optional(),
		deletedAdminAt: z.coerce.date().optional(),
		admin: z.boolean().optional(),
	}),
});

const designs = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: `${DBDIR}/designs` }),
	schema: z.object({
		designId: z.number().optional(),
		designName: z.string().optional(), // already in the object-filename
		description: z.string(),
		tags: z.string().array(),
		owner: reference('users'),
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
		updateCount: z.number(),
		visitedAt: z.coerce.date().optional(),
		visitCount: z.number().optional(),
		deletedAt: z.coerce.date().optional(),
		visible: z.boolean(),
		likeCount: z.number().optional(),
		likeLastUsers: z.string().array().max(3).optional(),
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
				fileType: z.enum([
					'image',
					'pxJson',
					'paxJson',
					'dxf',
					'svg',
					'stl',
					'brep',
					'step',
					'stp',
					'iges',
					'igs',
					'glb',
					'3mf',
					'txtLog',
					'scad',
					'jsCad',
					'jsManifold',
					'pyFreecad',
				]),
				filePath: z.string(),
				fileSize: z.number(),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
				updateCount: z.number().optional(),
				downloadedAt: z.coerce.date().optional(),
				downloadCount: z.number().optional(),
				deletedAt: z.coerce.date().optional(),
			})
		),
	}),
});

export const collections = { users, designs };
