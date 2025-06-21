import {
	lineNumbers,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	highlightActiveLine,
} from "@codemirror/view";
import { history } from "@codemirror/commands";
import { indentOnInput } from "@codemirror/language";
import { autocompletion } from "@codemirror/autocomplete";
import { highlightSelectionMatches } from "@codemirror/search";

export const coreExtensions = [
	lineNumbers(),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	drawSelection(),
	history(),
	indentOnInput(),
	autocompletion(),
	highlightActiveLine(),
	highlightSelectionMatches(),
];
