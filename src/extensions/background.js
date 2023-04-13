/* eslint-disable */
// @ts-nocheck

class objOfTrees {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

const extensions = 'https://developer.chrome.com/docs/extensions';
const webstore = 'https://developer.chrome.com/docs/webstore';
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

//
var openCount = 0;
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == 'devtools-page') {
    openCount++;
    port.onDisconnect.addListener(function (port) {
      openCount--;
    });
  }
});

let connections = {};

chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  // assign the listener function to a variable so we can remove it later
  if (devToolsConnection.name == 'devtools-page') {
    var devToolsListener = function (message, sender, sendResponse) {
      // Inject a content script into the identified tab
      connections[message.tabId] = devToolsConnection;
      //expecting tabId and file:scriptToInject
      console.log(connections[message.tabId]);
      chrome.scripting
        .executeScript({
          //target tab
          target: { tabId: message.tabId },
          //inject the content script to above tab
          files: [message.scriptToInject],
        })
        .then(() => console.log('script injected'));
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

//4/10
// remove the connection for a tab when the tab is closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId in connections) {
    delete connections[tabId];
  }
});
//end 4 10

// Message listener for content script
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   //new 4/11
//   if (request.action === 'getTree') {
//     sendResponse({ tree: trees[request.tabId] });
//   }
//   //new 4/11
//   // Messages from content scripts should have sender.tab set
//   if (sender.tab) {
//     console.log(sender.tab.id);
//     var tabId = sender.tab.id;
//     if (tabId in connections) {
//       connections[tabId].postMessage(request);
//     } else {
//       console.log('Tab not found in connection list.');
//     }
//   } else {
//     console.log('sender.tab not defined.');
//   }
//   return true;
// });

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   var currentTabId = tabs[0].id;
//   console.log('Current tab ID in background query:', currentTabId);
// });

let treeOfTrees = {};

//
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
const tab = getCurrentTab();
console.log('logging tab from background using query ' + tab);
//testing
chrome.tabs.onActivated.addListener((activeInfo) => {
  let selectedTabId = activeInfo.tabId;
  chrome.runtime.onMessage.addListener((message) => {
    // Get the tree object from the message
    if (message.tree) {
      // console.log('selected TabId ' + selectedTabId);
      treeOfTrees[selectedTabId] = message.tree;
      console.log('this is treeOfTrees');
      console.log(treeOfTrees);
      chrome.runtime.sendMessage({ fromBGtree1: treeOfTrees });
      // chrome.runtime.sendMessage({ simp: message.tree });
    }
    if (message.nestedObject) {
      // Do something with the tree object
      treeOfTrees[selectedTabId] = message.nestedObject;
      chrome.runtime.sendMessage({ fromBGtree2: treeOfTrees });
    }
    if (message.storedVitals) {
      // Do something with the tree object
      console.log('storing vitals');
      // chrome.runtime.sendMessage({ storedVitals: message.storedVitals });
    }
  });
});

// const port = chrome.runtime.connect({ name: 'knockknock' });
// port.postMessage({ joke: 'Knock knock' });
// console.log(port.name);
// port.onMessage.addListener(function (msg) {
//   console.log('msg in content.js', msg);
//   if (msg.question === "Who's there?")
//     port.postMessage({ treeData: treeOfTrees });
//   else if (msg.question === 'Madame who?')
//     port.postMessage({ answer: 'Madame... Bovary' });
// });
