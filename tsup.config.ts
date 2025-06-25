import { defineConfig } from 'tsup'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Parse package.json to get version and dependencies
const pkg = JSON.parse(
	readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

export default defineConfig({
	entry: {
		'index': 'src/index.ts',
		'components/index': 'src/components/index.ts',
	},
	format: ['esm', 'cjs'],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: [
		'vue',
		...Object.keys(pkg.peerDependencies || {}),
	],
	esbuildOptions(options) {
		options.banner = {
			js: `/**
 * vue-translator-sdk v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 */`,
		}
	},
})
