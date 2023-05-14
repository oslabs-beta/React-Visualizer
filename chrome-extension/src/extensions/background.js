// const extensions = 'https://developer.chrome.com/docs/extensions';
// const webstore = 'https://developer.chrome.com/docs/webstore';

//creating a context menu
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    title: 'C-React',
    id: 'cReactContextMenu',
    contexts: ['selection'],
  });
});

//opening up a new window when the cReact is selected
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == 'cReactContextMenu') {
    chrome.windows.create({
      url: 'panel.html',
    });
  }
});

let openCount = 0;

let connections = {};
let selectedTabId;

chrome.tabs.onActivated.addListener((activeInfo) => {
  selectedTabId = activeInfo.tabId;
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == 'devtools-page') {
    openCount++;
    port.onDisconnect.addListener(function (port) {
      openCount--;
    });
  }
});
chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  // assign the listener function to a variable so we can remove it later
  if (devToolsConnection.name == 'devtools-page') {
    var devToolsListener = function (message, sender, sendResponse) {
      // Inject a content script into the identified tab
      const tabId = sender.tab.id;
      if (tabId === selectedTabId) {
        connections[message.tabId] = devToolsConnection;
        //expecting tabId and file:scriptToInject
        chrome.scripting
          .executeScript({
            //target tab
            target: { tabId: message.tabId },
            //inject the content script to above tab
            files: [message.scriptToInject],
          })
          .then(() => console.log('script injected'));
      }
    };
    // add the listener to the one time message - postMessage
    devToolsConnection.onMessage.addListener(devToolsListener);

    // when we are disconnected, we remove the listener
    devToolsConnection.onDisconnect.addListener(function () {
      devToolsConnection.onMessage.removeListener(devToolsListener);
      var tabs = Object.keys(connections);
      for (var i = 0, len = tabs.length; i < len; i++) {
        if (connections[tabs[i]] == devToolsConnection) {
          //delete the connection tab
          delete connections[tabs[i]];
          break;
        }
      }
    });
  }
});
