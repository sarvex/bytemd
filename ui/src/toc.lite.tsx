import { useStore } from '@builder.io/mitosis'
import { Root, cx, BytemdLocale, getTocData } from 'bytemd'

export default function Toc(props: {
  hast: Root
  currentBlockIndex: number
  locale: BytemdLocale
  visible: boolean
  onClick: (index: number) => void
}) {
  const state = useStore({
    get data() {
      return getTocData(props.hast, props.currentBlockIndex)
    },
  })

  return (
    <div class={cx('bytemd-toc', { 'bytemd-hidden': !props.visible })}>
      <h2>{props.locale.toc}</h2>
      <ul>
        {state.data.items.map((item, index) => (
          <li
            class={cx(`bytemd-toc-${item.level}`, {
              'bytemd-toc-active': state.data.currentHeadingIndex === index,
              'bytemd-toc-first': item.level === state.data.minLevel,
            })}
            style={{
              paddingLeft: `${(item.level - state.data.minLevel) * 16 + 8}px`,
            }}
            onClick={() => props.onClick(index)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
