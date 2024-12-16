// @ts-check
import { defineConfig } from 'astro/config';
//import node from "@astrojs/node";

const basePath = process.env.BASE_PATH;

// https://astro.build/config
export default defineConfig({
	base: basePath ? basePath : '/',
	output: 'static',
	//output: "server",
	//adapter: node({
	//	mode: "standalone",
	//}),
});
