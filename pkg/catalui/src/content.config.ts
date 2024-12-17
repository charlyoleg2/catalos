// src/content.config.ts

import { defineCollection, z } from 'astro:content';
//import { glob, file } from 'astro/loaders';
import { glob } from 'astro/loaders';

const users = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './collections/users' }),
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

export const collections = { users };
