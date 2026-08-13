import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess({})],

	onwarn: (warning, handler) => {
		if (warning.code === 'state_referenced_locally') return;
		handler(warning);
	},

	kit: {
		// Despliegue en Netlify: https://kit.svelte.dev/docs/adapter-netlify
		adapter: adapter({ edge: false }),
		serviceWorker: { register: false },
		files: { serviceWorker: 'src/service-worker.ts' },
		alias: { '.prisma/client/index-browser': require.resolve('@prisma/client/index-browser') }
	}
};

export default config;
