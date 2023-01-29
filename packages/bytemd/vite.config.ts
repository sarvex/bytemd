import { sveltePreprocessor } from '../../scripts/utils.mjs'
import { defineLibConfig } from '../../scripts/utils.mjs'
import pkg from './package.json'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineLibConfig({
  pkg,
  plugins: [
    svelte({
      preprocess: sveltePreprocessor,
    }),
  ],
})
