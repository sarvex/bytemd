// @ts-check
import { packages, rootDir, sveltePreprocessor } from '../scripts/utils.mjs'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import { defineConfig } from 'vite'

const alias = {
  'bytemd/locales': path.resolve(rootDir, 'packages/bytemd/locales'),
  ...packages.reduce((res, name) => {
    res[name === 'bytemd' ? name : `@bytemd/${name}`] = path.resolve(
      rootDir,
      'packages',
      `${name}/src/index.ts`
    )
    return res
  }, {}),
}

console.log(alias)

export default defineConfig({
  base: '/playground/',
  resolve: {
    alias,
  },
  plugins: [svelte({ preprocess: sveltePreprocessor })],
})
