const jsdom = require('jsdom');
const { JSDOM } = jsdom;

class ChromeMock {
  constructor() {
    this.reset = this.reset.bind(this);
    this.reset();
  }

  createBrowserAction(options) {
    const browserAction = {
      window: (new JSDOM('', { runScripts: 'dangerously' })).window
    };
    this.browserAction = browserAction;
    this.browserAction.window.chrome = {
      tabs: {
        query: this.onBrowserActionTabsQuery.bind(this),
        sendMessage: this.onRuntimeSendMessage.bind(this, null)
      }
    };
    if (options.script) {
      const script = this.browserAction.window.document.createElement('script');
      script.innerHTML = options.script;
      this.browserAction.window.document.body.appendChild(script);
    }
    return this.browserAction;
  }

  createTab(options) {
    const html = options.html || '';
    const tabId = this.tabs.length;
    const tab = {
      id: tabId,
      tabId: tabId,
      window: (new JSDOM(html, { runScripts: 'dangerously' })).window,
      __onRuntimeMessageListeners: []
    };
    this.tabs.push(tab);
    this.tabs[tabId].window.chrome = {
      runtime: {
        onMessage: this.addRuntimeMessageListener.bind(this, tabId),
        sendMessage: this.onRuntimeSendMessage.bind(this, tabId)
      }
    };
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

  onBrowserActionTabsQuery(options, sendResponse) {
    sendResponse(this.tabs.map(tab => ({ id: tab.id })));
  }

  onRuntimeSendMessage(senderTabId, tabId, message, sendResponse) {
    const sender = {
      tab: {
        id: senderTabId
      }
    }
    if (typeof tabId === 'number') {
      if (this.tabs[tabId]) {
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

  reset() {
    this.browserAction = null;
    this.tabs = [];
  }
}

module.exports = new ChromeMock();
