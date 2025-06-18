// this plugin is used to test the notification system and modal actions

// Show the modal only once
self.postMessage({
  type: 'showModal',
  payload: {
    content: `
      <h2>Test Plugin Modal</h2>
      <p>Click a button to show a notification of that type:</p>
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button style="cursor: pointer;" data-action="notify-info">Show Info</button>
        <button style="cursor: pointer;" data-action="notify-warning">Show Warning</button>
        <button style="cursor: pointer;" data-action="notify-error">Show Error</button>
      </div>
      <pre><code>console.log('Hello from the test plugin!');</code></pre>
    `
  }
});

// Listen for actions from the modal buttons
self.onmessage = (event) => {
  const { type, action } = event.data || {};
  if (type === 'modal-action') {
    if (action === 'notify-info') {
      self.postMessage({ type: 'showNotification', payload: { message: 'Info notification from modal button!', severity: 'info' } });
    } else if (action === 'notify-warning') {
      self.postMessage({ type: 'showNotification', payload: { message: 'Warning notification from modal button!', severity: 'warning' } });
    } else if (action === 'notify-error') {
      self.postMessage({ type: 'showNotification', payload: { message: 'Error notification from modal button!', severity: 'error' } });
    }
  }
};