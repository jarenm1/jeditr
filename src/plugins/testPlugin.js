// this plugin is used to test the notification system and modal actions

// Register a keybind to open the modal (Ctrl+M)
self.postMessage({
  type: 'registerKeybind',
  payload: {
    id: 'plugin.testPlugin.openModal',
    keys: ['Ctrl', 'M'],
    description: 'Toggle the Test Plugin Modal',
    action: 'openModal',
  }
});

// Register a keybind to test action notifications (Ctrl+Shift+T)
self.postMessage({
  type: 'registerKeybind',
  payload: {
    id: 'plugin.testPlugin.testAction',
    keys: ['Ctrl', 'Shift', 'T'],
    description: 'Test notification with action button',
    action: 'testAction',
  }
});

function showTestModal() {
  self.postMessage({
    type: 'showModal',
    payload: {
      content: `
        <h2>Test Plugin Modal (Toggle)</h2>
        <p><strong>Press Ctrl+M again to close this modal!</strong></p>
        <p>Click a button to show a notification of that type:</p>
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <button style="cursor: pointer;" data-action="notify-info">Show Info</button>
          <button style="cursor: pointer;" data-action="notify-warning">Show Warning</button>
          <button style="cursor: pointer;" data-action="notify-error">Show Error</button>
          <button style="cursor: pointer;" data-action="notify-action">Show Action</button>
        </div>
        <pre><code>console.log('Hello from the test plugin!');</code></pre>
        <p style="font-size: 12px; color: #666; margin-top: 12px;">
          This modal demonstrates toggle behavior - pressing the same keybind again will close it.
        </p>
      `
    }
  });
}

function showActionNotification() {
  self.postMessage({
    type: 'showNotification',
    payload: {
      message: 'This is a test notification with an action button!',
      severity: 'info',
      action: {
        label: 'Send Another',
        actionId: 'testPlugin.sendAnother'
      }
    }
  });
}

// Show the modal on load (optional, or remove if you only want keybind)
// showTestModal();

// Listen for actions from the modal buttons and for plugin-action keybind
self.onmessage = (event) => {
  const { type, action, actionId } = event.data || {};
  if (type === 'modal-action') {
    if (action === 'notify-info') {
      self.postMessage({ type: 'showNotification', payload: { message: 'Info notification from modal button!', severity: 'info' } });
    } else if (action === 'notify-warning') {
      self.postMessage({ type: 'showNotification', payload: { message: 'Warning notification from modal button!', severity: 'warning' } });
    } else if (action === 'notify-error') {
      self.postMessage({ type: 'showNotification', payload: { message: 'Error notification from modal button!', severity: 'error' } });
    } else if (action === 'notify-action') {
      showActionNotification();
    }
  } else if (type === 'plugin-action') {
    if (action === 'openModal') {
      showTestModal();
    } else if (action === 'testAction') {
      showActionNotification();
    }
  } else if (type === 'executeAction') {
    if (actionId === 'testPlugin.sendAnother') {
      self.postMessage({
        type: 'showNotification',
        payload: {
          message: 'Action button was clicked! Here\'s another notification.',
          severity: 'warning'
        }
      });
    }
  } 
};