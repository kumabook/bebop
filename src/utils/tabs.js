import browser from 'webextension-polyfill';

export function getActiveTab() {
  const options = { currentWindow: true, active: true };
  return browser.tabs.query(options).then((tabs) => {
    if (tabs.length > 0) {
      return tabs[0];
    }
    return null;
  });
}

export function sendMessageToActiveTab(msg) {
  return getActiveTab().then((tab) => {
    if (tab && tab.id) {
      return browser.tabs.sendMessage(tab.id, msg);
    }
    return Promise.reject(new Error('No active tab'));
  });
}
