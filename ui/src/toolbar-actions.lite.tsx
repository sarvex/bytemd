import { tippyClass } from 'bytemd'
import { cx } from 'bytemd'
import { BytemdAction } from 'bytemd'

export default function ToolbarActions(props: { actions: BytemdAction[] }) {
  return props.actions.map((item, index) => (
    // FIXME: item.handler &&
    <div
      class={cx('bytemd-toolbar-icon', tippyClass)}
      bytemd-tippy-path={index}
      innerHTML={item.icon}
    ></div>
  ))
}
