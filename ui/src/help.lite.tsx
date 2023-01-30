import { useStore } from '@builder.io/mitosis'
import { BytemdAction, BytemdLocale, cx } from 'bytemd'

export default function Help(props: {
  actions: BytemdAction[]
  locale: BytemdLocale
  visible: boolean
}) {
  const state = useStore({
    get items() {
      function flatItems(actions: BytemdAction[]) {
        let items: BytemdAction[] = []

        actions.forEach((action) => {
          const { handler, cheatsheet } = action
          if (handler?.type === 'dropdown') {
            items.push(...flatItems(handler.actions))
          }
          if (cheatsheet) {
            items.push(action)
          }
        })

        return items
      }

      return flatItems(props.actions)
    },
    get cheatsheetItems() {
      return state.items.filter((action) => action.cheatsheet)
    },
    get shortcutsItems() {
      return state.items.filter(
        (action) => action.handler?.type === 'action' && action.handler.shortcut
      )
    },
  })

  return (
    <div class={cx('bytemd-help', { 'bytemd-hidden': !props.visible })}>
      <h2>{props.locale.cheatsheet}</h2>
      <ul>
        {state.cheatsheetItems.map((action) => (
          <li>
            <div class="bytemd-help-icon" innerHTML={action.icon}></div>
            <div class="bytemd-help-title">{action.title}</div>
            <div class="bytemd-help-content">
              <code>{action.cheatsheet}</code>
            </div>
          </li>
        ))}
      </ul>
      <h2>{props.locale.shortcuts}</h2>
      <ul>
        {state.shortcutsItems.map((action) => (
          <li>
            <div class="bytemd-help-icon" innerHTML={action.icon}></div>
            <div class="bytemd-help-title">{action.title}</div>
            <div class="bytemd-help-content">
              <kbd>{action.handler.shortcut}</kbd>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
