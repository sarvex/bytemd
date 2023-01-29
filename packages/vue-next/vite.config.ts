import { defineLibConfig } from '../../scripts/utils.mjs'
import pkg from './package.json'
import vue from '@vitejs/plugin-vue'

export default defineLibConfig({
  pkg,
  plugins: [vue()],
})
