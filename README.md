## chrome-mock

### Caveats

#### No isolated world

#### Risk of XSS / Self-XSS

#### Single window

### Roadmap status

#### Supported

````
chrome.runtime.sendMessage
````

#### To be implemented

````
chrome.tabs.query
chrome.tabs.sendMessage

Isolated world for content_scripts
````


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
