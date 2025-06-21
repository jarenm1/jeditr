import { LanguageSupport } from "@codemirror/language";

export interface BottomBarPlugin {
  id: string;
  render: () => React.ReactNode;
  order?: number;
}

export interface EditorPanePlugin {
  contentType: string;
  render: (props: any) => React.ReactNode;
}

export type LanguageDetector = (
  filePath: string,
  content?: string,
) => string | undefined;

export interface LanguagePlugin {
  id: string;
  names: string[];
  extensions: string[];
  loader: () => Promise<LanguageSupport>;
  detectors?: LanguageDetector[];
  priority?: number;
}
