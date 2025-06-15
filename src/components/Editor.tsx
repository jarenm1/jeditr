import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { v4 as uuidv4 } from 'uuid';
import { useVimStore } from '@store/vimStore';

/**
 * EditorSettings
 * @param theme - Monaco theme name (string) or Monaco theme object (for custom themes)
 * @param themeName - Optional theme name for custom themes
 * @param fontSize - Editor font size
 * @param fontFamily - Editor font family
 * @param lineHeight - Editor line height
 * @param vimMode - Enable Vim keybindings if true
 */
export interface EditorSettings {
  theme?: string | monaco.editor.IStandaloneThemeData;
  themeName?: string;
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

export interface EditorProps {
  content: string;
  language?: string;
  onChange: (value: string) => void;
  settings?: EditorSettings;
}

export const Editor: React.FC<EditorProps> = ({ content, language = 'plaintext', onChange, settings }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const customThemeNameRef = useRef<string | null>(settings?.themeName || null);
    const [themeReady, setThemeReady] = React.useState(false);
    const { setMode, setCommand, setMessage } = useVimStore();

    // 1. Define and set the theme, then mark as ready
    useEffect(() => {
      if (!settings?.theme) return;
      if (typeof settings.theme === 'string') {
        monaco.editor.setTheme(settings.theme);
        setThemeReady(true);
      } else if (typeof settings.theme === 'object' && settings.theme.base) {
        if (!customThemeNameRef.current) {
          customThemeNameRef.current = 'custom-theme-' + uuidv4();
        }
        monaco.editor.defineTheme(customThemeNameRef.current, settings.theme);
        monaco.editor.setTheme(customThemeNameRef.current);
        setThemeReady(true);
      }
    }, [settings?.theme, settings?.themeName]);

    // 2. Only create the editor once
    useEffect(() => {
        if (!themeReady) return;
        if (editorRef.current && !editorInstance.current) {
            editorInstance.current = monaco.editor.create(editorRef.current, {
                value: content,
                language,
                theme: settings?.theme && typeof settings.theme === 'string' ? settings.theme : (settings?.theme && typeof settings.theme === 'object' ? (customThemeNameRef.current || 'vs-dark') : 'vs-dark'),
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: settings?.fontSize ?? 14,
                fontFamily: settings?.fontFamily,
                lineHeight: settings?.lineHeight,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                tabSize: 2,
                wordWrap: 'on',
            });
            const disposable = editorInstance.current.onDidChangeModelContent(() => {
                if (editorInstance.current) {
                    onChange(editorInstance.current.getValue());
                }
            });
            // Integrate with monaco-vim and update global Vim store
            if (settings?.vimMode && (window as any).initVimMode) {
                const vimMode = (window as any).initVimMode(editorInstance.current, null);
                // Listen for mode changes
                if (vimMode?.vim) {
                    vimMode.vim.on('vim-mode-change', (e: any) => {
                        setMode(e.mode);
                    });
                    // Optionally listen for command/message events if available
                }
            }
            return () => {
                disposable.dispose();
                if (editorInstance.current) {
                    const model = editorInstance.current.getModel();
                    editorInstance.current.dispose();
                    model?.dispose();
                    editorInstance.current = null;
                }
            };
        }
    }, [themeReady, settings?.fontSize, settings?.fontFamily, settings?.lineHeight, settings?.theme]);

    // 4. Update editor value if content prop changes (external update)
    useEffect(() => {
        if (editorInstance.current && editorInstance.current.getValue() !== content) {
            editorInstance.current.setValue(content);
        }
    }, [content]);

    // 5. Update language if prop changes
    useEffect(() => {
        if (editorInstance.current) {
            monaco.editor.setModelLanguage(editorInstance.current.getModel()!, language);
        }
    }, [language]);

    return (
        <div className="monaco-editor flex-1 min-h-0 h-full" ref={editorRef} />
    );
};