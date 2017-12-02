import browser from 'webextension-polyfill';

export function getActiveTabId() {
  const options = { currentWindow: true, active: true };
  return browser.tabs.query(options).then((tabs) => {
    if (tabs.length > 0) {
      return tabs[0].id;
    }
    return null;
  });
}

export function sendMessageToActiveTab(msg) {
  return getActiveTabId().then((id) => {
    if (id) {
      return browser.tabs.sendMessage(id, msg);
    }
    return Promise.reject(new Error('No active tab'));
  });
}