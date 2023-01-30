import { BytemdAction, BytemdEditorContext } from './types'
import { delegate } from 'tippy.js'

export type { DelegateInstance } from 'tippy.js'

export const tippyClass = 'bytemd-tippy'
export const tippyClassRight = 'bytemd-tippy-right'
export const tippyPathKey = 'bytemd-tippy-path'

export function getPayloadFromElement(
  e: Element,
  actions: BytemdAction[],
  rightActions: BytemdAction[]
) {
  const paths = e
    .getAttribute(tippyPathKey)
    ?.split('-')
    ?.map((x) => parseInt(x, 10))
  if (!paths) return
  // if (!paths) {
  //   return {
  //     paths: [],
  //     item: {
  //       title: 'test',
  //       handler: actions,
  //     },
  //   };
  // }

  let item: BytemdAction = {
    title: '',
    handler: {
      type: 'dropdown',
      actions: e.classList.contains(tippyClassRight) ? rightActions : actions,
    },
  }
  paths?.forEach((index) => {
    if (item.handler?.type === 'dropdown') {
      item = item.handler.actions[index]
    }
  })

  return { paths, item: item }
}

export function initTippy(
  dom: HTMLElement,
  actions: BytemdAction[],
  rightActions: BytemdAction[],
  context: BytemdEditorContext
) {
  return delegate(dom, {
    target: `.${tippyClass}`,
    onCreate({ setProps, reference }) {
      const payload = getPayloadFromElement(reference, actions, rightActions)
      if (!payload) return
      const { item, paths } = payload
      const { handler } = item
      if (!handler) return

      if (handler.type === 'action') {
        setProps({
          content: item.title,
          onHidden(ins) {
            ins.destroy()
          },
        })
      } else if (handler.type === 'dropdown') {
        // dropdown
        const dropdown = document.createElement('div')
        dropdown.classList.add('bytemd-dropdown')

        if (item.title) {
          const dropdownTitle = document.createElement('div')
          dropdownTitle.classList.add('bytemd-dropdown-title')
          dropdownTitle.appendChild(document.createTextNode(item.title))
          dropdown.appendChild(dropdownTitle)
        }

        handler.actions.forEach((subAction, i) => {
          const dropdownItem = document.createElement('div')
          dropdownItem.classList.add('bytemd-dropdown-item')
          dropdownItem.setAttribute(tippyPathKey, [...paths, i].join('-'))
          if (subAction.handler?.type === 'dropdown') {
            dropdownItem.classList.add(tippyClass)
          }
          if (reference.classList.contains(tippyClassRight)) {
            dropdownItem.classList.add(tippyClassRight)
          }
          // div.setAttribute('data-tippy-placement', 'right');
          dropdownItem.innerHTML = `${
            subAction.icon
              ? `<div class="bytemd-dropdown-item-icon">${subAction.icon}</div>`
              : ''
          }<div class="bytemd-dropdown-item-title">${subAction.title}</div>`
          dropdown.appendChild(dropdownItem)
        })

        setProps({
          allowHTML: true,
          showOnCreate: true,
          theme: 'light-border',
          placement: 'bottom-start',
          interactive: true,
          interactiveDebounce: 50,
          arrow: false,
          offset: [0, 4],
          content: dropdown.outerHTML,
          onHidden(ins) {
            ins.destroy()
          },
          onCreate(ins) {
            ;[...ins.popper.querySelectorAll('.bytemd-dropdown-item')].forEach(
              (el, i) => {
                const actionHandler = handler.actions[i]?.handler
                if (actionHandler?.type === 'action') {
                  const { mouseenter, mouseleave } = actionHandler
                  if (mouseenter) {
                    el.addEventListener('mouseenter', () => {
                      mouseenter(context)
                    })
                  }
                  if (mouseleave) {
                    el.addEventListener('mouseleave', () => {
                      mouseleave(context)
                    })
                  }
                }
              }
            )
          },
        })
      }
    },
  })
}
