import {
  onMount,
  onUnMount,
  onUpdate,
  useRef,
  useStore,
} from '@builder.io/mitosis'
import { getProcessor, BytemdPlugin, ViewerProps } from 'bytemd'

export default function Viewer(props: ViewerProps) {
  const state = useStore({
    index: 0,
    cbs: [] as ReturnType<NonNullable<BytemdPlugin['viewerEffect']>>[],
    get file() {
      return getProcessor({
        plugins: props.plugins, // TODO: dispatch hast tree
        sanitize: props.sanitize,
        remarkRehype: props.remarkRehype,
      }).processSync(props.value)
    },
  })

  const body = useRef<HTMLDivElement>()

  function on() {
    // console.log('von')
    state.cbs = props.plugins.map((p) =>
      p.viewerEffect?.({ markdownBody: body, file: state.file })
    )
  }
  function off() {
    // console.log('voff')
    state.cbs.forEach((cb) => cb?.())
  }

  onMount(() => {
    body.addEventListener('click', (e) => {
      const $ = e.target as HTMLElement
      if ($.tagName !== 'A') return

      const href = $.getAttribute('href')
      if (!href?.startsWith('#')) return

      body.querySelector('#user-content-' + href.slice(1))?.scrollIntoView()
    })
  })
  onUnMount(off)
  onUpdate(() => {
    // TODO: `off` should be called before DOM update
    // https://github.com/sveltejs/svelte/issues/6016
    off()
    on()
  })

  return (
    <div
      ref={body}
      innerHTML={`${state.file}<!--${(state.index = state.index + 1)}-->`}
    />
  )
}
