## chrome-mock

A Chrome messaging mock for integration testing.

It allows testing message passing between content_scripts, background pages, and browser_actions.

Currently supports:

````
chrome.tabs.query
chrome.tabs.sendMessage
chrome.runtime.onMessage
chrome.runtime.sendMessage
````

See `chrome-mock.test.js` for examples of usage in tests.

## API

```
const ChromeMock = require('chrome-mock');
```

### Tabs

#### Create a tab

```
const tab = ChromeMock.createTab({
  content_scripts?: [String],
  html?: String
});
```

#### Set tab as active

```
ChromeMock.setActiveTab(tab.id);
```

#### Tab API

```
tab.id
tab.window
```

### Browser Action

```
const browserAction = ChromeMock.createBrowserAction({
  script?: String  
});
```

### Current limits

#### No isolated world

Unlike real content_scripts, content_scripts in ChromeMock Tabs aren't run in an "isolated world". That means they can interact with JS created in the HTML passed to `ChromeMock.createTab({ html: <> })`. If your content_script behavior relies on an isolated world, it will not work.

#### Risk of Self-XSS

This uses JSDOM's "run scripts dangerously", which can cause self-XSS if running against content_scripts you do not control. See https://github.com/jsdom/jsdom#executing-scripts

#### Single window

No support yet for Tabs in multiple windows.

### Influences

For unit testing, I recommend https://github.com/sethmcl/chrome-mock or https://github.com/acvetkov/sinon-chrome.

This library targets integration testing.

### License

MIT
