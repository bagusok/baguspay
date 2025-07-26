import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import * as React from 'react'

// --- Tiptap Core Extensions ---
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Placeholder, Selection } from '@tiptap/extensions'

// --- UI Primitives ---
import { Button } from '~/components/tiptap/tiptap-ui-primitive/button'
import { Spacer } from '~/components/tiptap/tiptap-ui-primitive/spacer'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '~/components/tiptap/tiptap-ui-primitive/toolbar'

// --- Tiptap Node ---
import '~/components/tiptap/tiptap-node/blockquote-node/blockquote-node.scss'
import '~/components/tiptap/tiptap-node/code-block-node/code-block-node.scss'
import '~/components/tiptap/tiptap-node/heading-node/heading-node.scss'
import { HorizontalRule } from '~/components/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import '~/components/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '~/components/tiptap/tiptap-node/image-node/image-node.scss'
import '~/components/tiptap/tiptap-node/list-node/list-node.scss'
import '~/components/tiptap/tiptap-node/paragraph-node/paragraph-node.scss'

// --- Tiptap UI ---
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { BlockquoteButton } from '~/components/tiptap/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '~/components/tiptap/tiptap-ui/code-block-button'
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from '~/components/tiptap/tiptap-ui/color-highlight-popover'
import { HeadingDropdownMenu } from '~/components/tiptap/tiptap-ui/heading-dropdown-menu'
import { ImageUploadButton } from '~/components/tiptap/tiptap-ui/image-upload-button'
import { LinkButton, LinkContent, LinkPopover } from '~/components/tiptap/tiptap-ui/link-popover'
import { ListDropdownMenu } from '~/components/tiptap/tiptap-ui/list-dropdown-menu'
import { MarkButton } from '~/components/tiptap/tiptap-ui/mark-button'
import { TextAlignButton } from '~/components/tiptap/tiptap-ui/text-align-button'
import { UndoRedoButton } from '~/components/tiptap/tiptap-ui/undo-redo-button'

// --- Icons ---
import { ArrowLeftIcon } from '~/components/tiptap/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '~/components/tiptap/tiptap-icons/highlighter-icon'
import { LinkIcon } from '~/components/tiptap/tiptap-icons/link-icon'

// --- Hooks ---
import { useCursorVisibility } from '~/hooks/use-cursor-visibility'
import { useIsMobile } from '~/hooks/use-mobile'
import { useWindowSize } from '~/hooks/use-window-size'

// --- Lib ---

// --- Styles ---
import StarterKit from '@tiptap/starter-kit'
import '~/components/tiptap/tiptap-templates/simple/simple-editor.scss'
import { DetailsButton } from '~/components/tiptap/tiptap-ui/details-button/details-button'

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} portal={isMobile} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <DetailsButton />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link'
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
  </>
)

export function SimpleEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const isMobile = useIsMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link'>('main')
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        'autocomplete': 'off',
        'autocorrect': 'off',
        'autocapitalize': 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        'class': 'simple-editor',
        // class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    extensions: [
      StarterKit,
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      // TaskList,
      // TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: 'details',
        },
      }),
      DetailsSummary,
      DetailsContent,
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === 'detailsSummary') {
            return 'Summary'
          }
          return ''
        },
      }),
      // ImageUploadNode.configure({
      //   accept: 'image/*',
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 3,
      //   upload: handleImageUpload,
      //   onError: (error) => console.error('Upload failed:', error),
      // }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main')
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
                }
              : {}
          }
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  )
}
