import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';
import { BreadcrumbBar } from './BreadcrumbBar';
import './Editor.css';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  path: string;
}

export const Editor: React.FC<EditorProps> = ({ content, onChange, path }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const vimStatusRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<ReturnType<typeof initVimMode> | null>(null);

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: content,
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        tabSize: 2,
        wordWrap: 'on',
      });

      editorInstanceRef.current = editor;

      // Set up change handler
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        onChange(value);
      });

      return () => {
        editor.dispose();
      };
    }
  }, []); // Empty dependency array since we only want to initialize once

  // Initialize Vim mode
  useEffect(() => {
    if (editorInstanceRef.current && vimStatusRef.current && !vimModeRef.current) {
      vimModeRef.current = initVimMode(editorInstanceRef.current, vimStatusRef.current);
    }

    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  // Update content when it changes externally
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (currentValue !== content) {
        editorInstanceRef.current.setValue(content);
      }
    }
  }, [content]);

  return (
    <div className="editor-wrapper">
      <BreadcrumbBar path={path} />
      <div className="editor-container">
        <div ref={editorRef} className="monaco-editor" />
        <div ref={vimStatusRef} className="vim-status-bar" />
      </div>
    </div>
  );
};