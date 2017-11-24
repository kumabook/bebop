import browser from 'webextension-polyfill';

const commands = [];

function contentCommands(q) {
  return commands
    .filter(n => n.includes(q))
    .map(name => ({
      id:    name,
      label: name,
      type:  'content',
      name,
    }));
}

function tabCommands(q) {
  return browser.tabs.query({})
    .then(l => l.filter(t => t.title.includes(q) || t.url.includes(q))
                .map(t => ({
                  id:    `${t.id}`,
                  label: `${t.title}: ${t.url}`,
                  type:  'tab',
                  name:  'move-tab',
                  args:  [t.id, t.windowId],
                })));
}

function historyCommands(q) {
  return browser.history.search({ text: q, startTime: 0 })
    .then(l => l.map(v => ({
      id:    `${v.id}`,
      label: `${v.title}:${v.url}`,
      type:  'history',
      name:  'open-history',
      args:  [v.url],
    })));
}

function bookmarkCommands(q) {
  return browser.bookmarks.search({ query: q })
    .then(l => l.map(v => ({
      id:    `${v.id}`,
      label: `${v.title}:${v.url}`,
      type:  'bookmark',
      name:  'open-bookmark',
      args:  [v.url],
    })));
}

function searchCommands(q) {
  return Promise.resolve([{
    id:    `google-seach-${q}`,
    label: `${q} － Search with Google`,
    type:  'search',
    name:  'google-search',
    args:  [q],
  }]);
}

function candidates(query) {
  const q = query.toLowerCase();
  return Promise.all([
    searchCommands(q),
    tabCommands(q),
    historyCommands(q),
    bookmarkCommands(q),
    contentCommands(q),
  ]).then(list => list.reduce((items, v) => items.concat(v), []));
}

function googleSearch(query) {
  return browser.tabs.create({
    url: `https://www.google.com/search?q=${query}`,
  });
}

function open(url) {
  return browser.tabs.create({ url });
}

function activateTab(tabId) {
  browser.tabs.update(tabId, { active: true });
}

function execute(command, postCommandToContent) {
  const { id, type, args } = command;
  switch (type) {
    case 'tab':
      activateTab.apply(this, args);
      break;
    case 'content': {
      postCommandToContent(id);
      break;
    }
    case 'search':
      googleSearch.apply(this, args);
      break;
    case 'history':
      open.apply(this, args);
      break;
    case 'bookmark':
      open.apply(this, args);
      break;
    default:
      break;
  }
}

export default {
  execute,
  candidates,
};
