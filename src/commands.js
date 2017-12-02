/* global URL: false */
import browser from 'webextension-polyfill';
import { getFaviconUrl } from './utils/url';
import { sendMessageToActiveTab } from './utils/tabs';

const commands = [];
const maxResults = 20;
const defaultLinkMaxResults = 5;
const linkMaxResults = 100;

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
    .then(l => l.filter(t => t.title.includes(q) || t.url.includes(q)).map(t => ({
      id:         `${t.id}`,
      label:      `${t.title}: ${t.url}`,
      type:       'tab',
      name:       'move-tab',
      args:       [t.id, t.windowId],
      faviconUrl: t.favIconUrl,
    })));
}

function historyCommands(q) {
  const startTime = 0;
  return browser.history.search({ text: q, startTime, maxResults })
    .then(l => l.map(v => ({
      id:         `${v.id}`,
      label:      `${v.title}:${v.url}`,
      type:       'history',
      name:       'open-history',
      args:       [v.url],
      faviconUrl: getFaviconUrl(v.url),
    })));
}

function bookmarkCommands(q) {
  if (q.length === 0) {
    return Promise.resolve([]);
  }
  return browser.bookmarks.search({ query: q })
    .then(l => l.slice(0, maxResults).map(v => ({
      id:         `${v.id}`,
      label:      `${v.title}:${v.url}`,
      type:       'bookmark',
      name:       'open-bookmark',
      args:       [v.url],
      faviconUrl: getFaviconUrl(v.url),
    })));
}

function searchCommands(q) {
  return Promise.resolve([{
    id:         `google-seach-${q}`,
    label:      `${q} － Search with Google`,
    type:       'search',
    name:       'google-search',
    args:       [q],
    faviconUrl: browser.extension.getURL('images/search.png'),
  }]);
}

function linkCommands(query) {
  const max = query.length === 0 ? defaultLinkMaxResults : maxResults;
  return sendMessageToActiveTab({
    type:    'FETCH_LINKS',
    payload: {
      query,
      maxResults: linkMaxResults,
    },
  }).then(links => links.slice(0, max).map(l => ({
    id:         `content-link-${l.id}`,
    label:      `${l.label}: ${l.url}`,
    type:       'link',
    name:       'open-link',
    args:       [l],
    faviconUrl: getFaviconUrl(l.url),
  }))).catch(() => []);
}

function candidates(query) {
  const q = query.toLowerCase();
  return Promise.all([
    searchCommands(q),
    linkCommands(q),
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
