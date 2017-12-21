import browser from 'webextension-polyfill';
import { getActiveTabId } from './popup_window';

export function getActiveTab() {
  const options = { currentWindow: true, active: true };
  return browser.tabs.query(options).then((tabs) => {
    if (tabs.length > 0) {
      return tabs[0];
    }
    return null;
  });
}

export function getActiveContentTab() {
  const activeTabId = getActiveTabId();
  if (activeTabId) {
    return browser.tabs.get(activeTabId);
  }
  return getActiveTab();
}

export function sendMessageToActiveContentTab(msg) {
  const type = 'ACTIVE_CONTENT_TAB';
  return browser.runtime.sendMessage({ type }).then((tab) => {
    if (tab && tab.id) {
      return browser.tabs.sendMessage(tab.id, msg);
    }
    return Promise.reject(new Error('No active tab'));
  });
}
