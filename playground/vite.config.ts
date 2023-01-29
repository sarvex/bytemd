// @ts-check
import { packages, rootDir, sveltePreprocessor } from '../scripts/utils.mjs'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import { defineConfig } from 'vite'

const alias = packages.reduce((res, name) => {
  res[name === 'bytemd' ? name : `@bytemd/${name}`] = path.resolve(
    rootDir,
    'packages',
    `${name}/src/index.ts`
  )
  return res
}, {})

export default defineConfig({
  base: '/playground/',
  resolve: { alias },
  plugins: [svelte({ preprocess: sveltePreprocessor })],
})
