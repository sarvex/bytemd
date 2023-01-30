import ToolbarActions from './toolbar-actions.lite'
import { onMount, useRef, useStore } from '@builder.io/mitosis'
import {
  BytemdLocale,
  BytemdAction,
  BytemdEditorContext,
  icons,
  initTippy,
  DelegateInstance,
  getPayloadFromElement,
  cx,
  tippyClass,
  tippyClassRight,
  tippyPathKey,
} from 'bytemd'

interface RightAction extends BytemdAction {
  active?: boolean
}

export default function Toolbar(props: {
  context: BytemdEditorContext
  split: boolean
  activeTab: false | 'write' | 'preview'
  fullscreen: boolean
  sidebar: false | 'help' | 'toc'
  locale: BytemdLocale
  actions: BytemdAction[]
  rightAfferentActions: BytemdAction[]
  onAction: (a: 'toc' | 'help' | 'write' | 'preview' | 'fullscreen') => void
}) {
  const toolbar = useRef<HTMLDivElement>(null)

  const state = useStore({
    delegateInstance: null as DelegateInstance | null,
    get rightActions() {
      const tocActive = props.sidebar === 'toc'
      const helpActive = props.sidebar === 'help'
      const writeActive = props.activeTab === 'write'
      const previewActive = props.activeTab === 'preview'

      return [
        {
          title: tocActive ? props.locale.closeToc : props.locale.toc,
          icon: icons.AlignTextLeftOne,
          handler: {
            type: 'action',
            click() {
              props.onAction('toc')
            },
          },
          active: tocActive,
        },
        {
          title: helpActive ? props.locale.closeHelp : props.locale.help,
          icon: icons.Helpcenter,
          handler: {
            type: 'action',
            click() {
              props.onAction('help')
            },
          },
          active: helpActive,
        },
        ...(props.split
          ? [
              {
                title: writeActive
                  ? props.locale.exitWriteOnly
                  : props.locale.writeOnly,
                icon: icons.LeftExpand,
                handler: {
                  type: 'action',
                  click() {
                    props.onAction('write')
                  },
                },
                active: writeActive,
              },
              {
                title: previewActive
                  ? props.locale.exitPreviewOnly
                  : props.locale.previewOnly,
                icon: icons.RightExpand,
                handler: {
                  type: 'action',
                  click() {
                    props.onAction('preview')
                  },
                },
                active: previewActive,
              },
            ]
          : []),

        {
          title: props.fullscreen
            ? props.locale.exitFullscreen
            : props.locale.fullscreen,
          icon: props.fullscreen ? icons.OffScreen : icons.FullScreen,
          handler: {
            type: 'action',
            click() {
              props.onAction('fullscreen')
            },
          },
        },
        {
          title: props.locale.source,
          icon: icons.GithubOne,
          handler: {
            type: 'action',
            click() {
              window.open('https://github.com/bytedance/bytemd')
            },
          },
        },
        ...props.rightAfferentActions,
      ] as RightAction[]
    },
    handleClick(e: MouseEvent | KeyboardEvent) {
      const target = (e.target as Element).closest(`[${tippyPathKey}]`)
      if (!target) return
      const handler = getPayloadFromElement(
        target,
        props.actions,
        state.rightActions
      )?.item?.handler
      if (handler?.type === 'action') {
        handler.click(props.context)
      }
      state.delegateInstance?.destroy()

      state.delegateInstance = initTippy(
        toolbar,
        props.actions,
        state.rightActions,
        props.context
      )
    },
  })

  onMount(() => {
    initTippy(toolbar, props.actions, state.rightActions, props.context)
  })

  return (
    <div class="bytemd-toolbar" ref={toolbar} onClick={state.handleClick}>
      {props.split ? (
        <ToolbarActions actions={props.actions} />
      ) : (
        <>
          <div
            onClick={() => props.onAction('write')}
            class="bytemd-toolbar-tab"
            class:bytemd-toolbar-tab-active={props.activeTab !== 'preview'}
          >
            {props.locale.write}
          </div>
          <div
            onClick={() => props.onAction('preview')}
            class="bytemd-toolbar-tab"
            class:bytemd-toolbar-tab-active={props.activeTab === 'preview'}
          >
            {props.locale.preview}
          </div>
        </>
      )}

      <div class="bytemd-toolbar-right">
        {state.rightActions.map((item, index) => (
          <div
            class={cx('bytemd-toolbar-icon', tippyClass, tippyClassRight)}
            class:bytemd-toolbar-icon-active={item.active}
            bytemd-tippy-path={index}
            innerHTML={item.icon}
          ></div>
        ))}
      </div>
    </div>
  )
}
