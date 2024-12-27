// @ts-check
import { defineConfig, envField } from 'astro/config';
//import node from "@astrojs/node";

const basePath = process.env.BASE_PATH;

// https://astro.build/config
export default defineConfig({
	env: {
		schema: {
			DBDIR: envField.string({ context: 'server', access: 'public', default: './d1' }),
		},
	},
	base: basePath ? basePath : '/',
	output: 'static',
	//output: "server",
	//adapter: node({
	//	mode: "standalone",
	//}),
});
