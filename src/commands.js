/* eslint-disable no-multi-spaces, comma-spacing, object-curly-newline */
import browser from 'webextension-polyfill';
import isUrl from 'is-url';
import { click } from './link';
import * as cursor from './cursor';
import { getActiveTab } from './utils/tabs';

const commandsOfType = {};
const commandList = [];
const EMPTY_URLS = ['about:newtab', 'about:blank'];

const noop = () => Promise.resolve();

export function activateTab(candidates) {
  const candidate = candidates.find(c => c.type === 'tab');
  if (candidate) {
    return browser.tabs.update(candidate.args[0], { active: true });
  }
  return Promise.resolve();
}

export function closeTab(candidates) {
  return Promise.all(candidates.map(({ type, args }) => {
    switch (type) {
      case 'tab':
        return browser.tabs.remove(args[0]);
      default:
        return Promise.resolve();
    }
  }));
}

export function open(url) {
  return getActiveTab().then((tab) => {
    if (!url) {
      return Promise.resolve();
    }
    if (tab && EMPTY_URLS.includes(tab.url)) {
      return browser.tabs.update(tab.id, { url });
    }
    return browser.tabs.create({ url });
  });
}

export function go(url) {
  return getActiveTab().then(tab => browser.tabs.update(tab.id, { url }));
}

export function openUrls(candidates) {
  return Promise.all(candidates.map(({ args }) => {
    if (isUrl(args[0])) {
      return open(args[0]);
    }
    return Promise.resolve();
  }));
}

export function goUrl(candidates) {
  const candidate = candidates.find(c => isUrl(c.args[0]));
  if (candidate) {
    return go(candidate.args[0]);
  }
  return Promise.resolve();
}

export function clickLink(candidates) {
  return Promise.all(candidates.map(({ type, args }) => {
    switch (type) {
      case 'link':
        return click(args[0]);
      default:
        return Promise.resolve();
    }
  }));
}

export function openLink(candidates) {
  return Promise.all(candidates.map(({ args }) => {
    if (args[0] && isUrl(args[0].url)) {
      return open(args[0].url);
    }
    return Promise.resolve();
  }));
}

export function openGoogleSearch(candidates) {
  const candidate = candidates.find(c => c.type === 'search');
  if (candidate) {
    const { args } = candidate;
    return open(`https://www.google.com/search?q=${args[0]}`);
  }
  return Promise.resolve();
}

export function goGoogleSearch(candidates) {
  const candidate = candidates.find(c => c.type === 'search');
  if (candidate) {
    const { args } = candidate;
    return go(`https://www.google.com/search?q=${args[0]}`);
  }
  return Promise.resolve();
}

export function deleteHistory(candidates) {
  return Promise.all(candidates.map(({ type, args }) => {
    switch (type) {
      case 'history':
        return browser.history.deleteUrl({ url: args[0] });
      default:
        return Promise.resolve();
    }
  }));
}

export function deleteBookmark(candidates) {
  return Promise.all(candidates.map(({ type, args }) => {
    switch (type) {
      case 'bookmark':
        return browser.bookmarks.remove(args[1]);
      default:
        return Promise.resolve();
    }
  }));
}

const googleSearchCommands = [
  { label: 'open'    , icon: 'open', handler: goGoogleSearch  , contentHandler: noop },
  { label: 'tab open', icon: 'tab' , handler: openGoogleSearch, contentHandler: noop },
];

const linkCommands = [
  { label: 'click'     , icon: 'click', handler: noop    , contentHandler: clickLink },
  { label: 'tab open'  , icon: 'tab'  , handler: openLink, contentHandler: noop },
];

const tabCommands = [
  { label: 'activate-tab', icon: 'tab'   , handler: activateTab, contentHandler: noop },
  { label: 'close-tab'   , icon: 'delete', handler: closeTab   , contentHandler: noop },
];

const historyCommands = [
  { label: 'open'    , icon: 'open'  , handler: goUrl        , contentHandler: noop },
  { label: 'tab open', icon: 'tab'   , handler: openUrls     , contentHandler: noop },
  { label: 'delete'  , icon: 'delete', handler: deleteHistory, contentHandler: noop },
];

const bookmarkCommands = [
  { label: 'open'    , icon: 'open'  , handler: goUrl         , contentHandler: noop },
  { label: 'tab open', icon: 'tab'   , handler: openUrls      , contentHandler: noop },
  { label: 'delete'  , icon: 'delete', handler: deleteBookmark, contentHandler: noop },
];

const cursorCommands = [
  { label: 'forward-char'        , icon: null, handler: noop, contentHandler: cursor.forwardChar },
  { label: 'backward-char'       , icon: null, handler: noop, contentHandler: cursor.backwardChar },
  { label: 'beginning-of-line'   , icon: null, handler: noop, contentHandler: cursor.beginningOfLine },
  { label: 'end-of-line'         , icon: null, handler: noop, contentHandler: cursor.endOfLine },
  { label: 'next-line'           , icon: null, handler: noop, contentHandler: cursor.nextLine },
  { label: 'previous-line'       , icon: null, handler: noop, contentHandler: cursor.previousLine },
  { label: 'end-of-buffer'       , icon: null, handler: noop, contentHandler: cursor.endOfBuffer },
  { label: 'beginning-of-buffer' , icon: null, handler: noop, contentHandler: cursor.beginningOfBuffer },
  { label: 'delete-backward-char', icon: null, handler: noop, contentHandler: cursor.deleteBackwardChar },
];

export function command2Candidate(c) {
  if (!c) {
    return null;
  }
  return Object.assign({}, c, {
    id:         c.label,
    type:       'command',
    faviconUrl: browser.extension.getURL(`images/${c.icon}.png`),
  });
}

export function register(name, commands) {
  commandsOfType[name] = commands;
  commands.forEach((c) => {
    if (!commandList.includes(c)) {
      commandList.push(c);
    }
  });
}

export function query(type = '', q = '') {
  const commands = commandsOfType[type] ? commandsOfType[type] : [];
  return commands.filter(c => c.label.includes(q)).map(command2Candidate);
}

export function find(name = '') {
  return command2Candidate(commandList.find(c => c.label === name));
}

export function defaulOf(type) {
  return commandsOfType[type];
}

export function init() {
  register('search'  , googleSearchCommands);
  register('link'    , linkCommands);
  register('tab'     , tabCommands);
  register('history' , historyCommands);
  register('bookmark', bookmarkCommands);
  register('cursor'  , cursorCommands);
}
