import React from 'react';
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';

interface EditorProps {
  initialCode: string;
  language?: string;
  theme?: string;
}

const Editor: React.FC<EditorProps> = ({ initialCode, language = 'typescript', theme = 'vs-dark' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorInstanceRef.current = monaco.editor.create(editorRef.current, {
        value: initialCode,
        language: language,
        theme: theme,
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        },
        wordWrap: 'on',
        wrappingStrategy: 'advanced',
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        glyphMargin: false,
        folding: true,
        renderLineHighlight: 'all',
        renderWhitespace: 'selection',
        contextmenu: true,
        mouseWheelZoom: true,
        padding: {
          top: 10,
          bottom: 10
        }
      });
    }

    return () => {
      editorInstanceRef.current?.dispose();
    };
  }, [initialCode, language, theme]);

  return <div ref={editorRef} style={{ height: '100%', width: '100%', overflow: 'hidden' }} />;
};

export default Editor;