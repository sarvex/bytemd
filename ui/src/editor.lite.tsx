import Help from './help.lite'
import Status from './status.lite'
import Toc from './toc.lite'
import Toolbar from './toolbar.lite'
import Viewer from './viewer.lite'
import { onMount, useRef, useStore } from '@builder.io/mitosis'
import {
  BytemdEditorContext,
  createCodeMirror,
  createEditorUtils,
  cx,
  EditorProps,
  getBuiltinActions,
} from 'bytemd'
import type { Editor as CmEditor } from 'bytemd'
import en from 'bytemd/locales/en.json'

export default function Editor(props: EditorProps) {
  const root = useRef<HTMLDivElement>()
  const editorEl = useRef<HTMLDivElement>()
  const previewEl = useRef<HTMLDivElement>()

  const state = useStore({
    codemirror: null as ReturnType<typeof createCodeMirror>,
    activeTab: false as false | 'write' | 'preview',
    sidebar: false as false | 'help' | 'toc',
    fullscreen: false,
    containerWidth: Infinity, // TODO: first screen
    editor: null as CmEditor | null,
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
        // @ts-ignore
        codemirror,
        editor: state.editor,
        root,
        ...createEditorUtils(state.codemirror, state.editor),
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
    state.codemirror = createCodeMirror()

    state.editor = state.codemirror(editorEl, {
      value: props.value,
      mode: 'yaml-frontmatter',
      lineWrapping: true,
      tabSize: 8, // keep consistent with preview: https://developer.mozilla.org/en-US/docs/Web/CSS/tab-size#formal_definition
      indentUnit: 4, // nested ordered list does not work with 2 spaces
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
      }, // https://github.com/codemirror/CodeMirror/blob/c955a0fb02d9a09cf98b775cb94589e4980303c1/mode/markdown/index.html#L359
      ...props.editorConfig,
      placeholder: props.placeholder,
    })

    // https://github.com/codemirror/CodeMirror/issues/2428#issuecomment-39315423
    // https://github.com/codemirror/CodeMirror/issues/988#issuecomment-392232020
    state.editor.addKeyMap({
      Tab: 'indentMore',
      'Shift-Tab': 'indentLess',
    })

    state.editor.on('change', () => {
      props.onChange(state.editor.getValue())
    })

    new ResizeObserver((entries) => {
      state.containerWidth = entries[0].contentRect.width
      // console.log(containerWidth);
    }).observe(root, { box: 'border-box' })
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
