const browser = {};

browser.i18n = {};
browser.i18n.getMessage = key => key;

browser.extension = {};
browser.extension.getURL = key => `moz-extension://extension-id/${key}`;

browser.runtime = {};
browser.runtime.connect = () => ({
  postMessage: () => {},
  onMessage:   {
    addListener:    () => {},
    removeListener: () => {},
  },
});
browser.runtime.onConnect = {
  addListener:    () => {},
  removeListener: () => {},
};
browser.runtime.browserInfo = () => Promise.resolve({ name: 'Firefox' });

browser.storage = {
  local: {
    get: () => Promise.resolve({}),
    set: () => Promise.resolve({}),
  },
};

browser.history = {
  search: () => Promise.resolve([]),
};

browser.bookmarks = {
  search: () => Promise.resolve([]),
};

browser.tabs = {
  create: () => Promise.resolve(),
  update: () => Promise.resolve(),
  query:  () => Promise.resolve([]),
};

browser.commands = {
  onCommand: {
    addListener:    () => {},
    removeListener: () => {},
  },
};

module.exports = browser;
