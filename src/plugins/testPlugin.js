let count = 1;
setInterval(() => {
  showNotification('TestPlugin', `Hello from the test plugin! ${count++}`, 'info');
  showNotification('TestPlugin', `Hello from the test plugin! ${count++}`, 'warning');
  showNotification('TestPlugin', `Hello from the test plugin! ${count++}`, 'error');
}, 10000);