// @ts-check
import { execSync } from 'child_process'
import chokidar from 'chokidar'

chokidar
  .watch(['ui/src/**/*', 'packages/bytemd/src'])
  .on('change', (event, path) => {
    console.log(event, path)

    execSync('pnpm --filter ui build && pnpm --filter svelte build', {
      stdio: 'inherit',
    })
  })
