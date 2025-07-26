import * as React from 'react'
import type { ButtonProps } from '~/components/tiptap/tiptap-ui-primitive/button'
import { Button } from '~/components/tiptap/tiptap-ui-primitive/button'
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'

export interface DetailsButtonProps extends Omit<ButtonProps, 'type'> {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional: pass editor instance directly (default: useTiptapEditor context)
   */
  editor?: any
}

/**
 * Button component for inserting a <details> node in a Tiptap editor.
 */
export const DetailsButton = React.forwardRef<HTMLButtonElement, DetailsButtonProps>(
  ({ editor: providedEditor, text, children, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor)
    const isActive = editor?.isActive?.('details')
    const canInsert = editor?.can().setDetails()

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (!editor) return
        editor.chain().focus().setDetails().run()
      },
      [editor]
    )

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? 'on' : 'off'}
        data-disabled={!canInsert}
        role="button"
        tabIndex={-1}
        aria-label={text || 'Insert Details'}
        aria-pressed={isActive}
        tooltip={text || 'Insert Details'}
        onClick={handleClick}
        disabled={!canInsert}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            {/* You can replace this with a details icon if available */}
            <span className="tiptap-button-icon">&#9660;</span>
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

DetailsButton.displayName = 'DetailsButton'
