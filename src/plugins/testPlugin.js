// Simple nanoid implementation for the worker
function nanoid(size = 21) {
  return Array.from({ length: size }, () =>
    (Math.random() * 36 | 0).toString(36)
  ).join('');
}

let count = 1;
setInterval(() => {
  self.postMessage({ type: 'showNotification', payload: { message: `Hello from the test plugin! ${count++}`, severity: 'info', timestamp: Date.now() } });
  self.postMessage({ type: 'showNotification', payload: { message: `Hello from the test plugin! ${count++}`, severity: 'warning', timestamp: Date.now() } });
  self.postMessage({ type: 'showNotification', payload: { message: `Hello from the test plugin! ${count++}`, severity: 'error', timestamp: Date.now() } });
}, 10000);