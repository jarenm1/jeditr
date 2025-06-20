import React, { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, StateEffect } from '@codemirror/state';
import { useVimStore } from '@ubar/ubarStore/vimStore';
import { coreExtensions } from './editorStore/codemirrorExtensions';
import { defaultKeymap } from '@codemirror/commands';

// Reuse EditorSettings and EditorProps from MonacoEditor for compatibility
export type { EditorSettings, EditorProps } from './MonacoEditor';

// Add a CodeMirror theme for white cursor using recommended style-mod spec and dark mode
const whiteCursorTheme = EditorView.theme({
  '& .cm-cursor': { borderLeftColor: '#fff !important' },
  '& .cm-dropCursor': { borderLeftColor: '#fff !important' },
}, { dark: true });

export const CodeMirrorEditor: React.FC<import('./MonacoEditor').EditorProps> = ({ content, language = 'plaintext', onChange, settings }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { setMode } = useVimStore();

  // Create the editor only once on mount
  useEffect(() => {
    if (!editorRef.current) return;
    if (viewRef.current) return;

    // Build initial extensions (without settings-dependent themes)
    const extensions = [
      ...coreExtensions,
      EditorView.lineWrapping,
      keymap.of(defaultKeymap),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange(v.state.doc.toString());
        }
      }),
      whiteCursorTheme,
    ];
    // Create the editor view
    viewRef.current = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions,
      }),
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [editorRef]);

  // Update settings (theme, font, etc) dynamically
  useEffect(() => {
    if (!viewRef.current) return;
    const themeSpecs: Record<string, any> = {};
    if (settings?.fontSize) {
      themeSpecs['fontSize'] = settings.fontSize + 'px';
    }
    if (settings?.fontFamily) {
      themeSpecs['fontFamily'] = settings.fontFamily;
    }
    if (settings?.lineHeight) {
      themeSpecs['lineHeight'] = settings.lineHeight;
    }
    // Build extensions array
    const extensions = [
      ...coreExtensions,
      EditorView.lineWrapping,
      keymap.of(defaultKeymap),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange(v.state.doc.toString());
        }
      }),
      whiteCursorTheme,
    ];
    if (Object.keys(themeSpecs).length > 0) {
      extensions.push(EditorView.theme({ '&': themeSpecs }));
    }
    if (settings?.vimMode) {
      extensions.push(EditorView.domEventHandlers({
        focus: () => setMode('normal'),
      }));
    }
    viewRef.current.dispatch({
      effects: [StateEffect.reconfigure.of(extensions)],
    });
  }, [settings, setMode, onChange]);

  // Update content if prop changes
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: content },
      });
    }
  }, [content]);

  return <div className="codemirror-editor flex-1 min-h-0 h-full" ref={editorRef} />;
};
