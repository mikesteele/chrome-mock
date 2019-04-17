const chrome = {};
chrome.runtime = {
  __listeners: []
};
chrome.runtime.onMessage = fn => __listeners.push(fn);
chrome.runtime.sendMessage = (message, cb) => chrome.runtime.__listeners.forEach(fn => fn(message, null, cb));
