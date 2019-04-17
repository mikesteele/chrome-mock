const chrome = {};
chrome.runtime = {
  __listeners: []
};
chrome.runtime.onMessage = fn => __listeners.push(fn);
chrome.runtime.sendMessage = (message, cb) => chrome.runtime.__listeners.forEach(fn => fn(message, null, cb));

//----------------------------//

const ChromeMock = require('chrome-mock');

const tab1 = ChromeMock.createTab({ content_scripts: ['/path/to/js'] });
// tab1 { tabIndex: 1, window: Window }

chrome.tabs.query() // [1]

tab1.window.DC.observer.start(); // Maybe it calls chrome.runtime.sendMessage

chrome.tabs.sendMessage(1, { ok: true }, () => {});
// Should call any listeners in tab1

ChromeMock.closeTab(1);
// Clean up

//----------------------------//

const extension = ChromeMock.createExtension({
  browser_action: '/path/to/js',
  background: '/path/to/js'
});

// extension: extensionId

extension.background.window
extension.browser_action.window

//----------------------------//

const manifest = require('./manifest.json');
const extension = ChromeMock.createExtension(manifest);
const tab1 = ChromeMock.createTab('http://google.com'); // ChromeMock.createTab('http://google.com', { html: xxx });

expect(tab1.window.DC).to.exist; // Should've injected into tab
