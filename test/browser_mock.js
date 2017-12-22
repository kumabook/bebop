const createPort = require('./create_port');

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
  create:    () => Promise.resolve({ id: 1 }),
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

browser.system = {
  display: {
    getInfo: callback => callback([{
      bounds: {
        left:   0,
        top:    0,
        width:  100,
        height: 100,
      },
    }]),
  },
};

module.exports = browser;
