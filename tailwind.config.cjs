const colors = require('tailwindcss/colors');

module.exports = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				nintendo: '#d5010f',
				gray: '#484848'
			}
		},
		fontFamily: {
			pixel: 'DogicaPixelRegular'
		}
	},
	variants: {
		extend: {}
	},
	plugins: []
};
