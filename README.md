VSCode fork to make me a billionaire. 

# Jeditr
A lightweight editor built with Tauri, React, Monaco editor (used in VSCode), & xterm.js. 
The goal of Jeditr is to promote user learning by providing a peer-programming experience not offered by current AI driven editors.

A feedback loop is important to learn. Instead of waiting for a code review, Jeditr uses AI suggestions for code architecture and security while your editing.

## Features

- **Multi-workspace Editor**: Organize your work across multiple workspaces
- **Integrated Terminal**: Built-in terminal with xterm.js
- **File System Integration**: Native file operations with Tauri
- **Vim Mode**: Full Vim keybindings support
- **Theme Support**: Customizable themes and appearance
- **Plugin Architecture**: Extensible plugin system for custom functionality

## Powerful Plugin System

Jeditr features a robust plugin system that allows you to extend the editor's functionality through Web Workers. Plugins can:

### **Core Capabilities**
- **Register Keybinds**: Add custom keyboard shortcuts
- **Show Notifications**: Display user notifications with action buttons
- **Create Modals**: Build custom UI dialogs
- **File Operations**: Read, write, and manipulate files
- **Language Support**: Register new language servers and syntax highlighting

### **Plugin Architecture**
- **Web Worker Based**: Plugins run in isolated Web Workers for security and performance
- **Message Passing**: Communication between plugins and main thread via structured messages
- **Namespaced Actions**: Prevent conflicts with proper action ID namespacing
- **Hot Reloading**: Plugins can be updated without restarting the editor

### **Plugin Development**
Plugins are written in JavaScript and follow a simple web worker message-based API

See [Plugin Examples](PLUGIN_EXAMPLES.md) for comprehensive code examples and best practices.

## Contributing

Jeditr is designed to be extensible and community-driven. Contributions are welcome in the form of:
- Plugin development
- Core feature improvements
- Documentation updates
- Bug reports and fixes

## License

[Add your license information here]
