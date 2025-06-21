import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { nanoid } from "nanoid";
import {
  startTerminalSession,
  sendTerminalInput,
} from "@services/terminalSession";

interface TerminalContentProps {
  content: any;
  editorSettings: any;
  sessionId?: string;
  onExit?: (sessionId: string, exitStatus: number | null) => void;
}

const TerminalContentRenderer: React.FC<TerminalContentProps> = ({
  content,
  editorSettings,
  sessionId: propSessionId,
  onExit,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const sessionId = useRef<string>(propSessionId || nanoid());
  const initialized = useRef(false);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      fontSize: editorSettings?.fontSize || 14,
      theme: { ...editorSettings?.theme, background: "transparent" },
      ...content?.terminalOptions,
    });
    term.open(terminalRef.current);
    xtermRef.current = term;

    // Start terminal session and set up listeners
    const cleanup = startTerminalSession(sessionId.current, {
      onOutput: (data) => term.write(data + "\r\n"),
      onError: (err) => term.write(`\r\n[Shell Error]: ${err}\r\n`),
      onExit: (status) => {
        term.write(`\r\n[Shell exited] Status: ${status ?? "unknown"}\r\n`);
        if (onExit) onExit(sessionId.current, status);
      },
    });

    term.onData((data) => sendTerminalInput(sessionId.current, data));
    if (content?.initialText) term.write(content.initialText);

    return () => {
      cleanup();
      term.dispose();
    };
  }, []);

  // Update terminal options on settings change
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options = {
        fontSize: editorSettings?.fontSize || 14,
        theme: { ...editorSettings?.theme, background: "transparent" },
        ...content?.terminalOptions,
      };
      xtermRef.current.refresh(0, xtermRef.current.rows);
    }
  }, [editorSettings]);

  return (
    <div
      ref={terminalRef}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    />
  );
};

export default TerminalContentRenderer;
