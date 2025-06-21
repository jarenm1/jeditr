import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { LanguageSupport } from "@codemirror/language";
import { useVimStore } from "@ubar/ubarStore/vimStore";
import { coreExtensions } from "./editorStore/codemirrorExtensions";
import { defaultKeymap } from "@codemirror/commands";
import { loadLanguage, getCachedLanguage } from "@plugins/api/language";
import { useLanguageStore } from "@ubar/ubarStore/languageStore";

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
  onChange: (value: string) => void;
  settings?: CodeMirrorEditorSettings;
  paneId?: string; // For tracking language per pane
}

// Add a CodeMirror theme for white cursor using recommended style-mod spec and dark mode
const whiteCursorTheme = EditorView.theme(
  {
    "& .cm-cursor": { borderLeftColor: "#fff !important" },
    "& .cm-dropCursor": { borderLeftColor: "#fff !important" },
  },
  { dark: true },
);

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ 
  content, 
  language = "plaintext", 
  onChange, 
  settings,
  paneId 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { setMode } = useVimStore();
  const { setPaneLanguage, setPaneLoadingState } = useLanguageStore();
  const [currentLanguageSupport, setCurrentLanguageSupport] = useState<LanguageSupport | null>(null);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false);

  // Memoize the onChange callback to prevent unnecessary re-renders
  const memoizedOnChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  // Load language support when language prop changes
  useEffect(() => {
    let cancelled = false;

    async function loadLanguageSupport() {
      console.debug(`[CodeMirrorEditor] Loading language: ${language} for pane: ${paneId}`);
      
      if (!language) {
        console.debug(`[CodeMirrorEditor] No language specified, setting to null`);
        if (!cancelled) {
          setCurrentLanguageSupport(null);
          setIsLoadingLanguage(false);
        }
        return;
      }

      // Update language store if we have a pane ID
      if (paneId) {
        setPaneLoadingState(paneId, true);
      }

      // Check if we already have this language cached
      const cached = getCachedLanguage(language);
      if (cached) {
        console.debug(`[CodeMirrorEditor] Using cached language support for: ${language}`, cached);
        if (!cancelled) {
          setCurrentLanguageSupport(cached);
          setIsLoadingLanguage(false);
          if (paneId) {
            setPaneLanguage(paneId, language);
            setPaneLoadingState(paneId, false);
          }
        }
        return;
      }

      console.debug(`[CodeMirrorEditor] Loading language from loader: ${language}`);
      setIsLoadingLanguage(true);
      
      try {
        const languageSupport = await loadLanguage(language);
        console.debug(`[CodeMirrorEditor] Loaded language support for ${language}:`, languageSupport);
        
        if (!cancelled) {
          setCurrentLanguageSupport(languageSupport);
          if (paneId) {
            setPaneLanguage(paneId, language);
          }
        }
      } catch (error) {
        console.error(`Failed to load language ${language}:`, error);
        // Fallback to no language support
        if (!cancelled) {
          setCurrentLanguageSupport(null);
          if (paneId) {
            setPaneLanguage(paneId, "plaintext");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLanguage(false);
          if (paneId) {
            setPaneLoadingState(paneId, false);
          }
        }
      }
    }

    loadLanguageSupport();

    return () => {
      cancelled = true;
    };
  }, [language]); // Only depend on language, not on paneId to avoid unnecessary reloads

  // Update pane language tracking when paneId changes
  useEffect(() => {
    if (paneId && currentLanguageSupport && language) {
      setPaneLanguage(paneId, language);
    }
  }, [paneId, language, currentLanguageSupport, setPaneLanguage]);

  // Memoize extensions to prevent unnecessary reconfiguration
  const extensions = useMemo(() => {
    console.debug(`[CodeMirrorEditor] Building extensions for language: ${language}, support:`, currentLanguageSupport);
    
    const baseExtensions = [
      ...coreExtensions,
      EditorView.lineWrapping,
      keymap.of(defaultKeymap),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          memoizedOnChange(v.state.doc.toString());
        }
      }),
      whiteCursorTheme,
    ];

    // Add language support if available and valid (null means plaintext/no highlighting)
    if (currentLanguageSupport && typeof currentLanguageSupport === 'object') {
      try {
        // Check if it's a proper LanguageSupport instance
        if (currentLanguageSupport.extension || currentLanguageSupport.language) {
          console.debug(`[CodeMirrorEditor] Adding language support to extensions:`, currentLanguageSupport);
          baseExtensions.push(currentLanguageSupport);
        } else {
          console.debug(`[CodeMirrorEditor] Language support object has no extension or language property:`, currentLanguageSupport);
        }
      } catch (error) {
        console.warn(`[CodeMirrorEditor] Invalid language support for ${language}, skipping:`, error);
      }
    } else {
      console.debug(`[CodeMirrorEditor] No language support available for ${language} (currentLanguageSupport=${currentLanguageSupport})`);
    }

    // Add settings-based themes
    const themeSpecs: Record<string, any> = {};
    if (settings?.fontSize) {
      themeSpecs["fontSize"] = settings.fontSize + "px";
    }
    if (settings?.fontFamily) {
      themeSpecs["fontFamily"] = settings.fontFamily;
    }
    if (settings?.lineHeight) {
      themeSpecs["lineHeight"] = settings.lineHeight;
    }
    if (Object.keys(themeSpecs).length > 0) {
      baseExtensions.push(EditorView.theme({ "&": themeSpecs }));
    }

    // Add vim mode support
    if (settings?.vimMode) {
      baseExtensions.push(
        EditorView.domEventHandlers({
          focus: () => setMode("normal"),
        }),
      );
    }

    return baseExtensions;
  }, [currentLanguageSupport, settings, memoizedOnChange, setMode, language]);

  // Create the editor only once on mount
  useEffect(() => {
    if (!editorRef.current) return;
    if (viewRef.current) return;

    // Create the editor view with initial extensions
    viewRef.current = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: extensions,
      }),
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []); // Only run once on mount

  // Reconfigure editor when extensions change
  useEffect(() => {
    if (!viewRef.current) return;

    try {
      viewRef.current.dispatch({
        effects: [StateEffect.reconfigure.of(extensions)],
      });
    } catch (error) {
      console.error(`[CodeMirrorEditor] Failed to reconfigure editor:`, error);
      // Try to recover by recreating the view
      if (editorRef.current) {
        viewRef.current?.destroy();
        viewRef.current = new EditorView({
          state: EditorState.create({
            doc: viewRef.current?.state.doc.toString() || content,
            extensions: extensions,
          }),
          parent: editorRef.current,
        });
      }
    }
  }, [extensions]); // Only reconfigure when extensions actually change

  // Update content if prop changes
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== content) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div className="codemirror-editor flex-1 min-h-0 h-full relative" ref={editorRef}>
      {isLoadingLanguage && (
        <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded z-10">
          Loading {language}...
        </div>
      )}
    </div>
  );
};
