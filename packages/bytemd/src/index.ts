import './index.scss'

export * from './types'
export { default as Editor } from './editor.svelte'
export { default as Viewer } from './viewer.svelte'
export { getProcessor } from './utils'

// common
export { default as cx } from 'classnames'
export { icons } from './icons'
// @ts-ignore
export { default as wordCount } from 'word-count'

export * from './editor'
export * from './toc'
export * from './toolbar'
