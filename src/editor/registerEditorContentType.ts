import React from 'react';
import { registerContentType } from '@editor/contentRegistry';
import { Editor } from '@editor/Editor';

registerContentType('editor', function EditorContentRenderer({ content, editorSettings }) {
  const { content: editorContent, language, onChange } = content.data;
  return React.createElement(Editor, {
    content: editorContent,
    language,
    onChange,
    settings: editorSettings,
  });
}); 