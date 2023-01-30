// @ts-check
import { sveltePreprocessor } from '../../scripts/utils.mjs'
import fs from 'fs-extra'
import path from 'path'
import { emitDts } from 'svelte2tsx'
import { preprocess } from 'svelte/compiler'

fs.ensureDirSync('dist')
fs.emptyDirSync('dist')

// some parts are from here https://github.com/sveltejs/kit/blob/master/packages/kit/src/packaging/typescript.js
await emitDts({
  svelteShimsPath: 'node_modules/svelte2tsx/svelte-shims.d.ts',
  declarationDir: '.',
})

const files = fs.readdirSync('src')
for (let file of files) {
  const source = fs.readFileSync(path.resolve('src', file), 'utf8')
  const { code } = await preprocess(source, sveltePreprocessor, {
    filename: file,
  })
  fs.writeFileSync(
    path.resolve('dist', file),
    code.replaceAll(' lang="ts"', '')
  )
}
