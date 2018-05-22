import browser from 'webextension-polyfill';
import logger from 'kiroku';
import search, { init as candidateInit } from './candidates';
import { init as actionInit, find as findAction } from './actions';
import {
  toggle as togglePopupWindow,
  onWindowFocusChanged,
  onTabActivated,
  onTabRemoved,
} from './popup_window';
import { getActiveContentTab } from './utils/tabs';
import idb from './utils/indexedDB';
import { getArgListener, setPostMessageFunction } from './utils/args';
import {
  createObjectStore,
  needDownload,
  downloadBookmarks,
} from './utils/hatebu';
import migrateOptions from './utils/options_migrator';
import config from './config';

let contentScriptPorts = {};
let popupPorts         = {};

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('FATAL');
}
logger.info(`bebop starts initialization. log level ${logger.getLevel()}`);

export function getContentScriptPorts() {
  return Object.values(contentScriptPorts);
}

export function getPopupPorts() {
  return Object.values(popupPorts);
}

function postMessageToContentScript(type, payload) {
  const currentWindow = true;
  const active        = true;
  return browser.tabs.query({ currentWindow, active }).then((tabs) => {
    if (tabs.length > 0) {
      const targetUrl = tabs[0].url;
      getContentScriptPorts().forEach(p => p.postMessage({
        type,
        payload,
        targetUrl,
      }));
    }
  });
}

export function postMessageToPopup(type, payload) {
  getPopupPorts().forEach(p => p.postMessage({
    type,
    payload,
  }));
}

export function executeAction(actionId, candidates) {
  const action = findAction(actionId);
  if (action && action.handler) {
    const f = action.handler;
    return f.call(this, candidates);
  }
  return Promise.resolve();
}

function toggleContentPopup() {
  const msg = { type: 'TOGGLE_POPUP' };
  return getActiveContentTab().then(t => browser.tabs.sendMessage(t.id, msg));
}

function handleContentScriptMessage() {}

function connectListener(port) {
  const { name } = port;
  logger.info(`connect channel: ${name}`);
  if (name.startsWith('content-script')) {
    contentScriptPorts[name] = port;
    port.onDisconnect.addListener(() => {
      delete contentScriptPorts[name];
      port.onMessage.removeListener(handleContentScriptMessage);
    });
    port.onMessage.addListener(handleContentScriptMessage);
  } else if (name.startsWith('popup')) {
    popupPorts[name] = port;
    port.onDisconnect.addListener(() => {
      delete popupPorts[name];
      postMessageToContentScript('POPUP_CLOSE');
    });
  }
  logger.info(`There are ${Object.values(contentScriptPorts).length} channel`);
}

function activatedListener(payload) {
  getPopupPorts().forEach(p => p.postMessage({
    type: 'TAB_CHANGED',
    payload,
  }));
  setTimeout(() => onTabActivated(payload), 10);
}

function downloadHatebu(userName) {
  try {
    if (needDownload()) {
      downloadBookmarks(userName);
    }
  } catch (e) {
    logger.trace(e);
  }
}

export function messageListener(request) {
  switch (request.type) {
    case 'SEND_MESSAGE_TO_ACTIVE_CONTENT_TAB': {
      return getActiveContentTab().then((tab) => {
        if (tab.url.startsWith('chrome://')) {
          return Promise.resolve();
        }
        return browser.tabs.sendMessage(tab.id, request.payload);
      });
    }
    case 'SEARCH_CANDIDATES': {
      const query = request.payload;
      return search(query);
    }
    case 'EXECUTE_ACTION': {
      const { actionId, candidates } = request.payload;
      return executeAction(actionId, candidates);
    }
    case 'RESPONSE_ARG': {
      const listener = getArgListener();
      listener(request.payload);
      break;
    }
    case 'DOWNLOAD_HATEBU': {
      downloadHatebu(request.payload);
      break;
    }
    default:
      break;
  }
  return null;
}

export function commandListener(command) {
  switch (command) {
    case 'toggle_popup_window':
      togglePopupWindow();
      break;
    case 'toggle_content_popup':
      toggleContentPopup();
      break;
    default:
      break;
  }
}

async function loadOptions() {
  const state = await browser.storage.local.get();
  migrateOptions(state);
  candidateInit(state);
  actionInit();
}

export async function storageChangedListener() {
  await loadOptions();
}

export async function init() {
  setPostMessageFunction(postMessageToPopup);
  contentScriptPorts = {};
  popupPorts         = {};

  await loadOptions();
  try {
    await idb.upgrade(config.dbName, config.dbVersion, db => createObjectStore(db));
    logger.info('create indexedDB');
  } catch (e) {
    logger.info(e);
  }

  browser.windows.onFocusChanged.addListener(onWindowFocusChanged);
  browser.runtime.onConnect.addListener(connectListener);
  browser.tabs.onActivated.addListener(activatedListener);
  browser.tabs.onRemoved.addListener(onTabRemoved);
  browser.runtime.onMessage.addListener(messageListener);
  browser.commands.onCommand.addListener(commandListener);
  browser.storage.onChanged.addListener(storageChangedListener);

  logger.info('bebop is initialized.');
}

init();
