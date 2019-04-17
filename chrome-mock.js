class ChromeMock {
  constructor() {
    this.tabs = [];
    this.extensions = [];
    this.chrome = {
      runtime: {
        sendMessage: onRuntimeSendMessage,
      }
    }
  }

  createTab(url, options) {
    if (!url) {
      throw new Error('URL required to create tab.');
    }
    const tab = {
      tabId: 1,
      window: new JSDOM(),
      close: () => {},
      __onRuntimeMessageListeners: []
    };
    tab.window.chrome = this.chrome;
    tab.window.chrome.runtime.onMessage = this.addRuntimeMessageListener.bind(this, tab.tabId);
    if (this.extensions.length) {
      // Check if need to inject content_scripts
    }
    this.tabs.push(tab);
    return tab;
  }

  createExtension(manifest) {
    // Don't inject into pre-existing tabs, as Chrome doesn't either
    const extension = {
      manifest: manifest,
      browser_action: 'TODO',
      background: 'TODO'
    };
  }

  addRuntimeMessageListener(tabId, callback) {
    if (this.tabs[tabId]) {
      this.tabs[tabId].__onRuntimeMessageListeners.push(callback);
    }
  }

  onRuntimeSendMessage(tabId, message, sendResponse) {
    if (!this.tabs[tabId]) {
      throw new Error('No such tab with tabId'); // TODO - What does Chrome do?
    }
    if (tabId) {
      this.tabs[tabId].__onRuntimeMessageListeners.forEach(listener => listener(message, sender, sendResponse));
    } else {
      // Call all tabs
    }
  }
}
