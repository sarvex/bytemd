import { defineLibConfig } from '../../scripts/utils.mjs'
import pkg from './package.json'
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineLibConfig({
  pkg,
  plugins: [createVuePlugin()],
})
