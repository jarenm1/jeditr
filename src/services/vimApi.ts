// Vim API interface for monaco-vim (CodeMirror Vim)
export function setLeader(leader: string) {
  if (typeof window !== 'undefined' && (window as any).Vim?.defineOption) {
    (window as any).Vim.defineOption('leader', leader, 'string');
  }
}

export function mapKey(sequence: string, command: string, mode: string = 'normal') {
  if (typeof window !== 'undefined' && (window as any).Vim?.map) {
    (window as any).Vim.map(sequence, command, mode);
  }
}

export function defineEx(name: string, command: string, fn: Function) {
  if (typeof window !== 'undefined' && (window as any).Vim?.defineEx) {
    (window as any).Vim.defineEx(name, command, fn);
  }
} 