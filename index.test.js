const expect = require('chai').expect;
const sinon = require('sinon');
const ChromeMock = require('chrome-mock');

const wait = (amount) => new Promise(resolve => setTimeout(resolve, amount));

describe('ChromeMock', () => {
  describe('messaging', () => {
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
