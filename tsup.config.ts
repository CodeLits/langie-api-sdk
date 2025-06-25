import { defineConfig } from 'tsup'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import vue from 'esbuild-plugin-vue-next'

// Parse package.json to get version and dependencies
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildPlugins: [vue()],
  external: ['vue', ...Object.keys(pkg.peerDependencies || {})],
  esbuildOptions(options) {
    options.banner = {
      js: `/**
 * langie-api-sdk v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 */`
    }
  }
})
