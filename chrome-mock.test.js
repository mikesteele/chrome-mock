const expect = require('chai').expect;
const sinon = require('sinon');
const ChromeMock = require('chrome-mock');

const wait = (amount) => new Promise(resolve => setTimeout(resolve, amount));

describe('ChromeMock', () => {
  beforeEach(() => {
    ChromeMock.reset();
  });
  describe('messaging', () => {
    describe('browser_action -> content_script', () => {
      it('should be able to query tabs', done => {
        const tab1 = ChromeMock.createTab({});
        const tab2 = ChromeMock.createTab({});

        const browserActionScript = `
          window.callback = () => {};  // To be stubbed
          window.runTest = () => {
            window.chrome.tabs.query({
              currentWindow: true,
              active: true
            }, tabs => {
              window.callback(tabs);
            });
          }
        `;
        const browserAction = ChromeMock.createBrowserAction({ script: browserActionScript });

        browserAction.window.callback = sinon.stub();

        browserAction.window.runTest();

        wait(100).then(() => {
          expect(browserAction.window.callback.calledWith([{
            id: 0
          }, {
            id: 1
          }])).to.be.true;
          done();
        });
      });
      it('should be able to send message to a particular tab', done => {
        const tab1 = ChromeMock.createTab({
          content_scripts: [`
            window.callback = () => {}; // To be stubbed
            window.chrome.runtime.onMessage((message, sender, sendResponse) => {
              window.callback(message, sender);
              sendResponse({ ok: true });
            });
            `]
        });
        const tab2 = ChromeMock.createTab({
          content_scripts: [`
            window.callback = () => {}; // To be stubbed
            window.chrome.runtime.onMessage((message, sender, sendResponse) => {
              window.callback(message, sender);
              sendResponse({ ok: false });
            });
            `]
        });
        tab1.window.callback = sinon.stub();
        tab2.window.callback = sinon.stub();

        const browserActionScript = `
          window.callback = () => {};  // To be stubbed
          window.runTest = () => {
            window.chrome.tabs.query({
              currentWindow: true,
              active: true
            }, tabs => {
              const targetTabId = tabs[0].id;
              window.chrome.tabs.sendMessage(targetTabId, {
                type: 'test'
              }, response => {
                window.callback(response);
              });
            });
          }
        `;
        const browserAction = ChromeMock.createBrowserAction({ script: browserActionScript });
        browserAction.window.callback = sinon.stub();

        browserAction.window.runTest();

        wait(200).then(() => {
          expect(tab1.window.callback.calledWith({
            type: 'test'
          })).to.be.true;
          expect(tab2.window.callback.called).to.be.false;
          expect(browserAction.window.callback.calledWith({
            ok: true
          })).to.be.true;
          done();
        });
      });
    });
    describe('content_script -> content_script', () => {
      it('should be able to send message between two content_scripts', done => {
        const contentScript1 = `
          window.callback = () => {};  // To be stubbed
          window.chrome.runtime.onMessage((message, sender, sendResponse) => {
            window.callback(message, sender);
            sendResponse({ response: true });
          });
        `;
        const tab1 = ChromeMock.createTab({ content_scripts: [contentScript1] });
        const contentScript2 = `
          window.callback = () => {}; // To be stubbed
          window.runTest = () => {
            window.chrome.runtime.sendMessage(undefined, { message: true }, response => {
              window.callback(response);
            });
          }
        `;
        const tab2 = ChromeMock.createTab({ content_scripts: [contentScript2] });

        // Set stubs
        tab1.window.callback = sinon.stub();
        tab2.window.callback = sinon.stub();

        // Run test
        tab2.window.runTest();
        wait(1000).then(() => {
          const expectedMessage = { message: true };
          const expectedResponse = { response: true };
          const expectedSender = { tab: { id: tab2.tabId } };
          expect(tab1.window.callback.calledWith(expectedMessage, expectedSender)).to.be.true;
          expect(tab2.window.callback.calledWith(expectedResponse)).to.be.true;
          done();
        });
      });
    });
  });
});
