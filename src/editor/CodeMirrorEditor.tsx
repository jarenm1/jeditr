import React, { useEffect, useRef, useState, useMemo } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { coreExtensions } from "./editorStore/codemirrorExtensions";
import { defaultKeymap } from "@codemirror/commands";

/**
 * CodeMirror Editor Settings
 * These are independent of Monaco but maintain similar interface for compatibility
 */
export interface CodeMirrorEditorSettings {
  theme?: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  vimMode?: boolean;
  keybindings?: {
    leader: string;
    fuzzyFinder: string[];
    fileSearch: string[];
  };
}

/**
 * CodeMirror Editor Props
 * Independent interface for CodeMirror editor component
 */
export interface CodeMirrorEditorProps {
  content: string;
  language?: string;
  onChange?: (content: string) => void;
  settings?: CodeMirrorEditorSettings;
  paneId?: string; // For tracking language per pane
}

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  content,
  language,
  onChange,
  settings,
  paneId,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Extensions configuration
  const extensions = useMemo(() => {
    const baseExtensions = [...coreExtensions];
    
    // Add update listener for content changes
    if (onChange) {
      baseExtensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        })
      );
    }
    
    return baseExtensions;
  }, [onChange]);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        ...extensions,
        keymap.of(defaultKeymap),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update content when prop changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === content) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content }
    });
  }, [content]);

  // Update extensions when they change
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: StateEffect.reconfigure.of([
        ...extensions,
        keymap.of(defaultKeymap),
      ])
    });
  }, [extensions]);

  return (
    <div className="relative h-full w-full">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
};
