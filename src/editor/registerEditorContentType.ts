import React from "react";
import { registerContentType } from "@editor/contentRegistry";
import { CodeMirrorEditor } from "@editor/CodeMirrorEditor";

registerContentType(
	"editor",
	function EditorContentRenderer({ content, editorSettings }) {
		const { content: editorContent, language, onChange } = content.data;
		return React.createElement(CodeMirrorEditor, {
			content: editorContent,
			language,
			onChange,
			settings: editorSettings,
		});
	},
);
