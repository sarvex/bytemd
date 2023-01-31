import Help from './help.lite'
import Status from './status.lite'
import Toc from './toc.lite'
import Toolbar from './toolbar.lite'
import Viewer from './viewer.lite'
import { onMount, onUpdate, useRef, useStore } from '@builder.io/mitosis'
import {
  basicSetup,
  BytemdEditorContext,
  cx,
  EditorProps,
  EditorView,
  getBuiltinActions,
  markdown,
} from 'bytemd'
import en from 'bytemd/locales/en.json'

export default function Editor(props: EditorProps) {
  const root = useRef<HTMLDivElement>()
  const editorEl = useRef<HTMLDivElement>()
  const previewEl = useRef<HTMLDivElement>()

  const state = useStore({
    editor: null as EditorView | null,
    activeTab: false as false | 'write' | 'preview',
    sidebar: false as false | 'help' | 'toc',
    fullscreen: false,
    containerWidth: Infinity, // TODO: first screen
    syncEnabled: true,

    get split() {
      return (
        props.mode === 'split' ||
        (props.mode === 'auto' && state.containerWidth >= 800)
      )
    },
    get mergedLocale() {
      return { ...en, ...props.locale }
    },
    get actions() {
      return getBuiltinActions(
        state.mergedLocale,
        props.plugins,
        props.uploadImages
      )
    },
    get context() {
      const context: BytemdEditorContext = {
        root,
        // ...createEditorUtils(state.codemirror, state.editor),
      }
      return context
    },
    get styles() {
      let edit: string
      let preview: string

      if (state.split && state.activeTab === false) {
        if (state.sidebar) {
          edit = `width:calc(50% - ${state.sidebar ? 140 : 0}px)`
          preview = `width:calc(50% - ${state.sidebar ? 140 : 0}px)`
        } else {
          edit = 'width:50%'
          preview = 'width:50%'
        }
      } else if (state.activeTab === 'preview') {
        edit = 'display:none'
        preview = `width:calc(100% - ${state.sidebar ? 280 : 0}px)`
      } else {
        edit = `width:calc(100% - ${state.sidebar ? 280 : 0}px)`
        preview = 'display:none'
        // TODO: use width:0 to make scroll sync work until
        // the position calculation improved (causes white screen after switching to editor only)
      }

      return { edit, preview }
    },
  })

  onMount(() => {
    const updateListener = EditorView.updateListener.of((vu) => {
      // console.log(vu)
      if (vu.docChanged) {
        props.onChange?.(vu.state.doc.toString())
      }
    })

    state.editor = new EditorView({
      doc: props.value,
      extensions: [basicSetup, markdown(), updateListener],
      parent: editorEl,
    })

    new ResizeObserver((entries) => {
      state.containerWidth = entries[0].contentRect.width
      // console.log(containerWidth);
    }).observe(root, { box: 'border-box' })
  })

  onUpdate(() => {
    if (state.editor.state.doc.toString() !== props.value) {
      state.editor.dispatch({
        changes: { from: 0, to: props.value.length, insert: props.value },
      })
    }
  })

  return (
    <div
      class={cx('bytemd', {
        'bytemd-split': state.split && state.activeTab === false,
        'bytemd-fullscreen': state.fullscreen,
      })}
      ref={root}
    >
      <Toolbar
        context={state.context}
        split={state.split}
        activeTab={state.activeTab}
        sidebar={state.sidebar}
        fullscreen={state.fullscreen}
        rightAfferentActions={state.actions.rightActions}
        locale={state.mergedLocale}
        actions={state.actions.leftActions}
        onTab={(v) => {
          if (state.split) {
            state.activeTab = state.activeTab === v ? false : v
          } else {
            state.activeTab = v
          }

          if (state.activeTab === 'write') {
            // tick().then(() => {
            //   editor && editor.focus()
            // })
            // TODO:
          }

          if (v === 'write') {
            // tick().then(() => {
            //   // https://github.com/bytedance/bytemd/issues/232
            //   // https://github.com/codemirror/codemirror5/issues/3270
            //   editor && editor.setSize(null, null)
            // })
            // TODO:
          }
        }}
        onClick={(action) => {
          switch (action) {
            case 'fullscreen':
              state.fullscreen = !state.fullscreen
              break
            case 'help':
              state.sidebar = state.sidebar === 'help' ? false : 'help'
              break
            case 'toc':
              state.sidebar = state.sidebar === 'toc' ? false : 'toc'
              break
          }
        }}
      />
      <div class="bytemd-body">
        <div class="bytemd-editor" ref={editorEl} />
        <div ref={previewEl} class="bytemd-preview">
          {(state.split || state.activeTab === 'preview') && (
            <Viewer
              value={props.value}
              plugins={props.plugins}
              sanitize={props.sanitize}
              remarkRehype={props.remarkRehype}
            />
          )}
        </div>
        <div
          class={cx('bytemd-sidebar', {
            'bytemd-hidden': state.sidebar === false,
          })}
        >
          <div
            class="bytemd-sidebar-close"
            onClick={() => {
              state.sidebar = false
            }}
          >
            {/* {@html icons.Close} */}
          </div>
          <Help
            locale={state.mergedLocale}
            actions={state.actions.leftActions}
            visible={state.sidebar === 'help'}
          />
          <Toc
            hast={{ type: 'root', children: [] }} // TODO:
            locale={state.mergedLocale}
            currentBlockIndex={0}
            visible={state.sidebar === 'toc'}
            onClick={(e) => {
              const headings = previewEl.querySelectorAll('h1,h2,h3,h4,h5,h6')
              headings[e].scrollIntoView()
            }}
          />
        </div>
      </div>
      <Status
        locale={state.mergedLocale}
        showSync={state.split}
        value={props.value}
        syncEnabled={state.syncEnabled}
        islimited={props.value.length > props.maxLength}
        onEnableSync={(v) => {
          state.syncEnabled = v
        }}
        onTop={() => {
          state.editor.scrollTo(null, 0)
          previewEl.scrollTo({ top: 0 })
        }}
      />
    </div>
  )
}
