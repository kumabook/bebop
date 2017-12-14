/* eslint-disable no-multi-spaces, comma-spacing, object-curly-newline */
import browser from 'webextension-polyfill';
import { click } from './link';
import * as cursor from './cursor';
import { getActiveTab } from './utils/tabs';

const commandsOfType = {};
const EMPTY_URLS = ['about:newtab', 'about:blank'];

const noop = () => Promise.resolve();

export function activateTab(tabId) {
  browser.tabs.update(tabId, { active: true });
}

export function closeTab(tabId) {
  browser.tabs.remove(tabId);
}

export function open(url) {
  return getActiveTab().then((tab) => {
    if (tab && EMPTY_URLS.includes(tab.url)) {
      return browser.tabs.update(tab.id, { url });
    }
    return browser.tabs.create({ url });
  });
}

export function openLink(link) {
  if (link.url) {
    return open(link.url);
  }
  return click(link);
}

export function go(url) {
  return getActiveTab().then(tab => browser.tabs.update(tab.id, { url }));
}

export function openGoogleSearch(q) {
  return open(`https://www.google.com/search?q=${q}`);
}

export function goGoogleSearch(q) {
  return go(`https://www.google.com/search?q=${q}`);
}

export function deleteHistory(url) {
  return browser.history.deleteUrl({ url });
}

export function deleteBookmark(url, id) {
  return browser.bookmarks.remove(id);
}

const googleSearchCommands = [
  { label: 'tab open', icon: 'tab' , handler: openGoogleSearch, contentHandler: noop },
  { label: 'open'    , icon: 'open', handler: goGoogleSearch  , contentHandler: noop },
];

const linkCommands = [
  { label: 'click'     , icon: 'click', handler: noop    , contentHandler: click },
  { label: 'tab open'  , icon: 'tab'  , handler: openLink, contentHandler: noop },
];

const tabCommands = [
  { label: 'activate-tab', icon: 'tab'   , handler: activateTab, contentHandler: noop },
  { label: 'close-tab'   , icon: 'delete', handler: closeTab   , contentHandler: noop },
];

const historyCommands = [
  { label: 'open'    , icon: 'open'  , handler: go           , contentHandler: noop },
  { label: 'tab open', icon: 'tab'   , handler: open         , contentHandler: noop },
  { label: 'delete'  , icon: 'delete', handler: deleteHistory, contentHandler: noop },
];

const bookmarkCommands = [
  { label: 'open'    , icon: 'open'  , handler: go            , contentHandler: noop },
  { label: 'tab open', icon: 'tab'   , handler: open          , contentHandler: noop },
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
}

export function query(type = '', q = '') {
  const commands = commandsOfType[type] ? commandsOfType[type] : [];
  return commands.filter(c => c.label.includes(q)).map(command2Candidate);
}

export function find(type = '', name = '') {
  const commands = commandsOfType[type] ? commandsOfType[type] : [];
  return command2Candidate(commands.find(c => c.label === name));
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
