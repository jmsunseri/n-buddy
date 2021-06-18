import preprocess from 'svelte-preprocess';
import path from 'path';
import vercel from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: {
			adapt: vercel
		},
		vite: {
			resolve: {
				alias: {
					$comp: path.resolve('./src/components'),
					$models: path.resolve('./src/models'),
					$store: path.resolve('./src/store')
				}
			}
		}
	}
};

export default config;
