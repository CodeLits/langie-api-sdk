import { defineConfig } from 'tsup'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import vue from 'esbuild-plugin-vue-next'

// Parse package.json to get version and dependencies
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      teleport: 'src/styles/teleport.css'
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [vue()],
    external: ['vue', ...Object.keys(pkg.peerDependencies || {})],
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs'
      }
    },
    esbuildOptions(options) {
      options.banner = {
        js: `/**
 * langie-api-sdk v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 * 
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 */`
      }
    }
  },
  {
    entry: {
      'components/index': 'src/components/index.ts'
    },
    format: ['esm', 'cjs'],
    dts: false, // Отключаем генерацию типов для компонентов
    splitting: false,
    sourcemap: true,
    clean: false,
    esbuildPlugins: [vue()],
    external: ['vue', ...Object.keys(pkg.peerDependencies || {})],
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs'
      }
    },
    esbuildOptions(options) {
      options.banner = {
        js: `/**
 * langie-api-sdk v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 * 
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 */`
      }
    }
  }
])
