import React from "react";
import { registerContentType } from "@editor/contentRegistry";
import { CodeMirrorEditor } from "@editor/CodeMirrorEditor";
// Import language API to ensure built-in languages are registered
import "@plugins/api/language";

registerContentType(
  "editor",
  function EditorContentRenderer({ content, editorSettings, paneId }) {
    const { content: editorContent, language, onChange } = content.data;
    return React.createElement(CodeMirrorEditor, {
      content: editorContent,
      language,
      onChange,
      settings: editorSettings,
      paneId,
    });
  },
);
