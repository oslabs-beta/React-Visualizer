/* eslint-disable */
// @ts-nocheck

/***
 * we are assuming webvitals package is installed from npm
 * To not use npm install:
 * <script type="module">
 *   import {onCLS, onFID, onLCP} from 'https://unpkg.com/web-vitals@3?module';
 * </script>
 */
import { onCLS, onFID, onLCP, onFCP, onTTFB, measure } from 'web-vitals';
//user device info
import { getDeviceInfo } from 'web-vitals-reporter';
console.log(getDeviceInfo());

let coreWebVitals = {};
function storeVitals() {
  //user need to interact with the page for FID to be reported
  onFID((metric) => {
    coreWebVitals.fid = Math.round(metric.value * 10000) / 10000;
    coreWebVitals.fidRating = metric.rating.toUpperCase();
  });

  //following metrics will not be reported if page was loaded in the background
  onLCP((metric) => {
    coreWebVitals.lcp = Math.round(metric.value * 10000) / 10000;
    coreWebVitals.lcpRating = metric.rating.toUpperCase();
  });
  //CLS
  onCLS((metric) => {
    coreWebVitals.cls = Math.round(metric.value * 10000) / 10000;
    coreWebVitals.clsRating = metric.rating.toUpperCase();
  });
  //FCP
  onFCP((metric) => {
    coreWebVitals.fcp = Math.round(metric.value * 10000) / 10000;
    coreWebVitals.fcpRating = metric.rating.toUpperCase();
  });
  //TTFB
  onTTFB((metric) => {
    coreWebVitals.ttfb = Math.round(metric.value * 10000) / 10000;
    coreWebVitals.ttfbRating = metric.rating.toUpperCase();
  });
  return coreWebVitals;
}
//storeVitals();

/**
 * @param {DOM node}
 * @return {treeWalker}
 */

const createWalker = (node) =>
  document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, walkerFilter);

const walkerFilter = {
  acceptNode(node) {
    if (
      node.nodeName.toLowerCase() === 'script' ||
      node.nodeName.toLowerCase() === 'noscript' ||
      node.nodeName.toLowerCase() === 'link' ||
      node.nodeName.toLowerCase() === 'style' ||
      node.nodeName.toLowerCase() === 'img' ||
      node.nodeName.toLowerCase() === 'iframe' ||
      node.nodeName.toLowerCase() === 'text' ||
      node.nodeName.toLowerCase() === 'tspan' ||
      node.tagName.toLowerCase() == 'svg'
    )
      return NodeFilter.FILTER_REJECT;
    else return NodeFilter.FILTER_ACCEPT;
  },
};

/**
 * Take properties of a DOM node and convert them to attributes for D3Node
 * @param {DOM node} DOM node
 * @return an object representing the attributes for D3Node.
 */
//TODO: decide what attributes to add to d3Node

function getAttributes(node) {
  return { type: node.className || node.nodeName };
}

/**
 * Get and return the children nodes of the node corresponding to a tree walker
 * @param {treeWalker} walker
 * @return an array of D3nodes that are children of the node corresponding to the walker
 */
function getChildren(walker) {
  let d3Children = []; //declare an array of d3nodes
  let childNode = walker.firstChild();

  //find all children of walker.currentNode
  while (childNode) {
    //convert walker to D3node
    let D3Node = createD3Node(walker);
    let childWalker = createWalker(walker.currentNode);
    //if the child node has children, recursively call the getChildren and assign the children to d3Node
    if (childNode.children.length > 0)
      D3Node.children = getChildren(childWalker);
    //add the newly created D3Node to the children array
    d3Children.push(D3Node);
    //walker move to the next sibling and reassign the childNode to the sibling node
    childNode = walker.nextSibling();
  }

  return d3Children;
}

/** Convert a walker to a D3 tree Node
 * @param {treeWalker} walker
 * @return {} node for D3 tree
 */
function createD3Node(walker) {
  //get the node corresponding to the walker object
  const node = walker.currentNode;
  //initialize and a new D3Node that will be returned later
  let D3Node = {};
  D3Node.name = node.nodeName;
  D3Node.attributes = getAttributes(node);
  return D3Node;
}

/** Traverse the DOM with the initial tree walker
 * @param {treeWalker} walker
 * @returns {} the root node of d3 Tree
 */
function grabData() {
  const root = document.body;
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    walkerFilter
  );
  const d3Node = createD3Node(walker);
  if (walker.currentNode.children.length > 0)
    d3Node.children = getChildren(walker);
  return d3Node;
}

//new 4.11
// function grabData() {
//   chrome.runtime.sendMessage({ type: 'getDOM' }, function (response) {
//     const root = response.dom;
//     const walker = createWalker(root);
//     const D3Node = createD3Node(walker);
//     D3Node.children = getChildren(walker);
//     // Call a function to display the D3 tree
//     displayD3Tree(D3Node);
//   });
// }

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.type === 'reload') {
//     grabData();
//   }
// });

// const root = document.getElementById(':root');
let d3Tree = grabData();
const treeData4 = JSON.stringify(d3Tree);
chrome.runtime.sendMessage({ tree: treeData4 });

const grabTree = new MutationObserver(() => {
  let updatedTree = grabData();
  chrome.runtime.sendMessage({ nestedObject: updatedTree });
  let updatedVitals = storeVitals();
  chrome.runtime.sendMessage({ storedVitals: updatedVitals });
});
const observerConfig = {
  attributes: true,
  childList: true,
  subtree: true,
};
grabTree.observe(document.documentElement, observerConfig);

//new
// grabTree.observe(document.documentElement, observerConfig);
// let visibilityHandler = () => {
//   if (document.hidden) {
//     grabTree.disconnect();
//   } else {
//     grabTree.observe(document.documentElement, observerConfig);
//   }
// };

// window.addEventListener('beforeunload', function () {
//   grabTree.disconnect();
// });

// window.addEventListener('visibilitychange', visibilityHandler);
//new
// const port = chrome.runtime.connect({ name: 'knockknock' });
// port.postMessage({ joke: 'Knock knock' });
// console.log(port.name);
// port.onMessage.addListener(function (msg) {
//   console.log('msg in content.js', msg);
//   if (msg.question === "Who's there?")
//     port.postMessage({ treeData: treeData4 });
//   else if (msg.question === 'Madame who?')
//     port.postMessage({ answer: 'Madame... Bovary' });
// });
