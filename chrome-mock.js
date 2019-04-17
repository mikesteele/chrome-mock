const jsdom = require('jsdom');
const { JSDOM } = jsdom;

class ChromeMock {
  constructor() {
    this.tabs = [];
    this.chrome = {
      runtime: {}
    }
  }

  createTab(options) {
    const tabId = this.tabs.length;
    const tab = {
      tabId: tabId,
      window: (new JSDOM('', { runScripts: 'dangerously' })).window,
      close: () => {}, // TODO
      __onRuntimeMessageListeners: []
    };
    this.tabs.push(tab);
    this.tabs[tabId].window.chrome = this.chrome;
    this.tabs[tabId].window.chrome.runtime.onMessage = this.addRuntimeMessageListener.bind(this, tabId);
    this.tabs[tabId].window.chrome.runtime.sendMessage = this.onRuntimeSendMessage.bind(this, tabId);
    if (options.content_scripts) {
      options.content_scripts.forEach(cs => {
        const script = this.tabs[tabId].window.document.createElement('script');
        script.innerHTML = cs;
        this.tabs[tabId].window.document.body.appendChild(script);
      });
    }
    return this.tabs[tabId];
  }

  addRuntimeMessageListener(tabId, callback) {
    if (this.tabs[tabId]) {
      this.tabs[tabId].__onRuntimeMessageListeners.push(callback);
    }
  }

  onRuntimeSendMessage(senderTabId, tabId, message, sendResponse) {
    const sender = {
      tab: {
        id: senderTabId // TODO - What to do for background page?
      }
    }
    if (tabId) {
      if (!this.tabs[tabId]) {
        throw new Error('No such tab with tabId'); // TODO - What does Chrome do?
      } else {
        this.tabs[tabId].__onRuntimeMessageListeners.forEach(listener => listener(message, sender, sendResponse));
      }
    } else {
      // Call all tabs
      this.tabs.forEach(tab => {
        tab.__onRuntimeMessageListeners.forEach(listener => {
          listener(message, sender, sendResponse)
        });
      });
    }
  }
}

module.exports = new ChromeMock();
