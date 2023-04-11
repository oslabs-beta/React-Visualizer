/* eslint-disable */
// @ts-nocheck

chrome.devtools.panels.create(
  'C-React',
  'assets/C_React_Logo.png',
  'Panel.html',
  () => {
    // code invoked on panel creation
  }
);

//keeping as a backup for performance metrics
chrome.devtools.panels.elements.createSidebarPane('Performance', (sidebar) => {
  // sidebar initialization code here
  console.log('testing if performance sidebar is working ');
  sidebar.setObject({ some_data: 'Some data to show' });
});

// Create a connection to the background page - long live
var backgroundPageConnection = chrome.runtime.connect({
  name: 'devtools-page',
});

//inject the content script - sending one time message
backgroundPageConnection.postMessage({
  //passing the tabId to the background
  tabId: chrome.devtools.inspectedWindow.tabId,
  scriptToInject: 'public/content.bundle.js',
});

//listening to the background page for the one time incoming message
backgroundPageConnection.onMessage.addListener(function (message) {
  // Handle responses from the background page, if any
  console.log(message);
});
