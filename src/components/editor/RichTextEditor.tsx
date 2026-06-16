import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import {
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Undo2,
  Redo2,
} from 'lucide-react'
import { ToolbarButton, ToolbarDivider } from './EditorToolbar'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

function normalizeContent(content: string): string {
  if (!content.trim()) return ''
  if (content.trim().startsWith('<')) return content
  return `<p>${content.replace(/\n/g, '</p><p>')}</p>`
}

function getReadingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 160))
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your post content...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full my-4' },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: normalizeContent(content),
    editorProps: {
      attributes: {
        class: 'tiptap-editor min-h-[400px] p-6 text-base focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  if (!editor) return null

  const wordCount = editor.storage.characterCount.words()
  const readingMinutes = getReadingMinutes(wordCount)

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL:', previousUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const setImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-card/50">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-secondary px-3 py-2">
        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          I
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Link" onClick={setLink} active={editor.isActive('link')}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Image URL" onClick={setImage}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t border-white/10 px-6 py-3 text-sm text-muted-foreground">
        {wordCount} words · About {readingMinutes} min read
      </div>
    </div>
  )
}
