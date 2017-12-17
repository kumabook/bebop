const browser = {};

browser.i18n = {};
browser.i18n.getMessage = key => key;

browser.extension = {};
browser.extension.getURL = key => `moz-extension://extension-id/${key}`;

browser.runtime = {};
browser.runtime.connect = () => {
  const listeners = [];
  return {
    listeners,
    postMessage: () => {},
    onMessage:   {
      addListener:    listener => listeners.push(listener),
      removeListener: (listener) => {
        listeners.some((v, i) => {
          if (v === listener) {
            listeners.splice(i, 1);
          }
          return null;
        });
      },
    },
  };
};
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
  create:      () => Promise.resolve(),
  update:      () => Promise.resolve(),
  query:       () => Promise.resolve([]),
  sendMessage: () => Promise.resolve(),
  onActivated: {
    addListener:    () => {},
    removeListener: () => {},
  },
};

browser.commands = {
  onCommand: {
    addListener:    () => {},
    removeListener: () => {},
  },
};

module.exports = browser;
