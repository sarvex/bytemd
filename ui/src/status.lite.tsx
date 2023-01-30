import { useStore } from '@builder.io/mitosis'
import { BytemdLocale, wordCount } from 'bytemd'

export default function Status(props: {
  showSync: boolean
  value: string
  syncEnabled: boolean
  locale: BytemdLocale
  islimited: boolean
  onEnableSync: (v: boolean) => void
  onTop: () => void
}) {
  const state = useStore({
    get words() {
      return wordCount(props.value)
    },
    get lines() {
      return props.value.split(`\n`).length
    },
  })

  return (
    <div class="bytemd-status">
      <div class="bytemd-status-left">
        <span>
          {props.locale.words}: <strong>{state.words}</strong>
        </span>
        <span>
          {props.locale.lines}: <strong>{state.lines}</strong>
        </span>
        {props.islimited && (
          <span class="bytemd-status-error">{props.locale.limited}</span>
        )}
      </div>

      <div class="bytemd-status-right">
        {props.showSync && (
          <label>
            <input
              type="checkbox"
              checked={props.syncEnabled}
              onChange={() => props.onEnableSync(props.syncEnabled)}
            />
            {props.locale.sync}
          </label>
        )}
        <span onClick={() => props.onTop()}>{props.locale.top}</span>
      </div>
    </div>
  )
}
