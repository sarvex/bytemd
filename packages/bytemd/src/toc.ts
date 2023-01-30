import type { Root, Element } from 'hast'
import { visit } from 'unist-util-visit'

export { Root }

function stringifyHeading(e: Element) {
  let result = ''
  visit(e, (node) => {
    if (node.type === 'text') {
      result += node.value
    }
  })
  return result
}

export function getTocData(hast: Root, currentBlockIndex: number) {
  const items = [] as { level: number; text: string }[]
  let currentHeadingIndex = 0
  let minLevel = 6

  hast.children
    .filter((v): v is Element => v.type === 'element')
    .forEach((node, index) => {
      if (node.tagName[0] === 'h' && !!node.children.length) {
        const i = Number(node.tagName[1])
        minLevel = Math.min(minLevel, i)
        items.push({
          level: i,
          text: stringifyHeading(node),
        })
      }

      // console.log(currentBlockIndex, index);
      if (currentBlockIndex >= index) {
        currentHeadingIndex = items.length - 1
      }
    })

  return {
    items,
    currentHeadingIndex,
    minLevel,
  }
}
