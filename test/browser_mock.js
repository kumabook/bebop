function createPort() {
  const messageListeners = [];
  return {
    messageListeners,
    postMessage: () => {},
    onMessage:   {
      addListener:    listener => messageListeners.push(listener),
      removeListener: (listener) => {
        messageListeners.some((v, i) => {
          if (v === listener) {
            messageListeners.splice(i, 1);
          }
          return null;
        });
      },
    },
    onDisconnect: {
      addListener:    () => {},
      removeListener: () => {},
    },
  };
}

const browser = {};

browser.i18n = {};
browser.i18n.getMessage = key => key;

browser.extension = {};
browser.extension.getURL = key => `moz-extension://extension-id/${key}`;

browser.runtime = {};
browser.runtime.connect = createPort;

const port = createPort();

browser.runtime.onConnect = {
  addListener:    () => {},
  removeListener: () => {},
};
browser.runtime.onMessage = port.onMessage;
browser.runtime.browserInfo = () => Promise.resolve({ name: 'Firefox' });
browser.runtime.sendMessage = () => Promise.resolve();

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
  get:         () => Promise.resolve(),
  create:      () => Promise.resolve(),
  update:      () => Promise.resolve(),
  query:       () => Promise.resolve([]),
  sendMessage: () => Promise.resolve(),
  onActivated: {
    addListener:    () => {},
    removeListener: () => {},
  },
};

browser.windows = {
  create:    () => Promise.resolve(),
  remove:    () => Promise.resolve(),
  onRemoved: {
    addListener:    () => {},
    removeListener: () => {},
  },
  onFocusChanged: {
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
