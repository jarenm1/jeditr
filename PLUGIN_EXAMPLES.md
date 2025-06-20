# Plugin Examples

This document contains comprehensive examples for developing plugins in Jeditr.

## Basic Plugin Structure

All plugins are Web Workers that communicate with the main thread via message passing.

```javascript
// Basic plugin structure
self.onmessage = (event) => {
  const { type, action, actionId } = event.data;
  // Handle messages from main thread
};

// Register capabilities on load
self.postMessage({
  type: 'registerKeybind',
  payload: {
    id: 'myPlugin.myAction',
    keys: ['Ctrl', 'Shift', 'A'],
    description: 'My custom action',
    action: 'myAction'
  }
});
```

## Keybind Registration

Register custom keyboard shortcuts for your plugin:

```javascript
// Register a simple keybind
self.postMessage({
  type: 'registerKeybind',
  payload: {
    id: 'myPlugin.openFile',
    keys: ['Ctrl', 'Shift', 'O'],
    description: 'Open file with my plugin',
    action: 'openFile'
  }
});

// Register multiple keybinds
const keybinds = [
  {
    id: 'myPlugin.action1',
    keys: ['Ctrl', 'Shift', '1'],
    description: 'First action',
    action: 'action1'
  },
  {
    id: 'myPlugin.action2', 
    keys: ['Ctrl', 'Shift', '2'],
    description: 'Second action',
    action: 'action2'
  }
];

keybinds.forEach(keybind => {
  self.postMessage({
    type: 'registerKeybind',
    payload: keybind
  });
});
```

## Notifications

Show notifications to users with optional action buttons:

### Basic Notifications

Notifications have three levels of severity:
- info
- warning
- error

```javascript
self.postMessage({
  type: 'showNotification',
  payload: {
    message: 'Operation completed successfully!',
    severity: 'info'
  }
});
```

### Notifications with Action Buttons
Notifications can optionally have an action button:
```javascript
self.postMessage({
  type: 'showNotification',
  payload: {
    message: 'Update available!',
    severity: 'info',
    action: {
      label: 'Update Now',
      actionId: 'myPlugin.updateNow'
    }
  }
});
```

## Handling Actions

Respond to user interactions with your notifications:

```javascript
self.onmessage = (event) => {
  const { type, action, actionId } = event.data;
  
  if (type === 'executeAction') {
    switch (actionId) {
      case 'myPlugin.updateNow':
        // Handle update action
        self.postMessage({
          type: 'showNotification',
          payload: {
            message: 'Starting update...',
            severity: 'info'
          }
        });
        break;
        
      case 'myPlugin.retryConnection':
        // Handle retry action
        self.postMessage({
          type: 'showNotification',
          payload: {
            message: 'Retrying connection...',
            severity: 'info'
          }
        });
        break;
        
      case 'myPlugin.saveFile':
        // Handle save action
        self.postMessage({
          type: 'showNotification',
          payload: {
            message: 'File saved successfully!',
            severity: 'info'
          }
        });
        break;
    }
  }
};
```

## Modals

Create custom UI dialogs:

```javascript
function showSettingsModal() {
  self.postMessage({
    type: 'showModal',
    payload: {
      content: `
        <h2>Plugin Settings</h2>
        <div style="margin: 16px 0;">
          <label>
            <input type="checkbox" id="autoSave" checked> Auto Save
          </label>
        </div>
        <div style="margin: 16px 0;">
          <label>
            Theme: 
            <select id="theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button data-action="save-settings">Save</button>
          <button data-action="cancel-settings">Cancel</button>
        </div>
      `
    }
  });
}

// Handle modal button clicks
self.onmessage = (event) => {
  const { type, action } = event.data;
  
  if (type === 'modal-action') {
    if (action === 'save-settings') {
      self.postMessage({
        type: 'showNotification',
        payload: {
          message: 'Settings saved!',
          severity: 'info'
        }
      });
    } else if (action === 'cancel-settings') {
      // Modal will close automatically
    }
  }
};
```
## Best Practices

### Action ID Namespacing
Always use namespaced action IDs to prevent conflicts:

```javascript
// ✅ Good - namespaced
actionId: 'myPlugin.saveFile'
actionId: 'myPlugin.updateNow'
actionId: 'myPlugin.retryConnection'

// ❌ Bad - could conflict
actionId: 'save'
actionId: 'update'
actionId: 'retry'
```

### Error Handling
Always handle potential errors gracefully:

```javascript
self.onmessage = (event) => {
  try {
    const { type, action, actionId } = event.data;
    // Handle message
  } catch (error) {
    // Show error notification
    self.postMessage({
      type: 'showNotification',
      payload: {
        message: 'Plugin encountered an error: ' + error.message,
        severity: 'error'
      }
    });
  }
};
```

### User Feedback
Provide clear feedback for all user actions:

```javascript
// Show progress notifications
self.postMessage({
  type: 'showNotification',
  payload: {
    message: 'Processing...',
    severity: 'info'
  }
});

// Show completion
self.postMessage({
  type: 'showNotification',
  payload: {
    message: 'Operation completed!',
    severity: 'info'
  }
});
```

## API Reference

### Message Types

#### From Plugin to Main Thread:
- `registerKeybind` - Register keyboard shortcuts
- `showNotification` - Display notifications
- `showModal` - Create custom dialogs

#### From Main Thread to Plugin:
- `plugin-action` - Keybind triggered
- `executeAction` - Notification action button clicked
- `modal-action` - Modal button clicked

### Notification Severities
- `info` - General information
- `warning` - Important warnings
- `error` - Error messages

### Keybind Modifiers
- `Ctrl` - Control key
- `Shift` - Shift key
- `Alt` - Alt key
- `Meta` - Command/Windows key

See the [test plugin](../src/plugins/testPlugin.js) for a complete working example. 