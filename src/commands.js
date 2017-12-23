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

function filter(candidates, candidateType) {
  return candidates.filter(({ type }) => type === candidateType);
}

function first(candidates, candidateType) {
  const candidate = candidates.find(c => c.type === candidateType);
  if (candidate) {
    return [candidate];
  }
  return [];
}

export function activateTab(cs) {
  return Promise.all(first(cs, 'tab').map(({ args }) => browser.tabs.update(args[0], { active: true })));
}

export function closeTab(cs) {
  return Promise.all(filter(cs, 'tab').map(({ args }) => browser.tabs.remove(args[0])));
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

export function openUrlsInNewTab(candidates) {
  return Promise.all(candidates.map(({ args }) => {
    if (isUrl(args[0])) {
      return open(args[0]);
    }
    return Promise.resolve();
  }));
}

export function openUrl(candidates) {
  const candidate = candidates.find(c => isUrl(c.args[0]));
  if (candidate) {
    return go(candidate.args[0]);
  }
  return Promise.resolve();
}

export function clickLink(cs) {
  return Promise.all(filter(cs, 'link').map(({ args }) => click(args[0])));
}

export function openLink(candidates) {
  return Promise.all(candidates.map(({ args }) => {
    if (args[0] && isUrl(args[0].url)) {
      return open(args[0].url);
    }
    return Promise.resolve();
  }));
}

function googleUrl(q) {
  return `https://www.google.com/search?q=${q}`;
}

export function searchWithGoogleInNewTab(cs) {
  return Promise.all(first(cs, 'search').map(({ args }) => open(googleUrl(args[0]))));
}

export function searchWithGoogle(cs) {
  return Promise.all(first(cs, 'search').map(({ args }) => go(googleUrl(args[0]))));
}

export function deleteHistory(cs) {
  return Promise.all(filter(cs, 'history').map(({ args }) => browser.history.deleteUrl({ url: args[0] })));
}

export function deleteBookmark(cs) {
  return Promise.all(filter(cs, 'bookmark').map(({ args }) => browser.bookmarks.remove(args[1])));
}

export function runCommand(cs) {
  return Promise.all(filter(cs, 'command').map(({ args }) => {
    const [name] = args;
    switch (name) {
      case 'open-options':
        return browser.runtime.openOptionsPage();
      default:
        return Promise.resolve();
    }
  }));
}

const googleSearchCommands = [
  { id: 'search-with-google'           , label: 'search with google'           , icon: 'open', handler: searchWithGoogle        , contentHandler: noop },
  { id: 'search-with-google-in-new-tab', label: 'search with google in new tab', icon: 'tab' , handler: searchWithGoogleInNewTab, contentHandler: noop },
];

const linkCommands = [
  { id: 'click'    , label: 'click'               , icon: 'click', handler: noop    , contentHandler: clickLink },
  { id: 'open-link', label: 'open link in new tab', icon: 'tab'  , handler: openLink, contentHandler: noop },
];

const tabCommands = [
  { id: 'activate-tab', label: 'activate tab', icon: 'tab'   , handler: activateTab, contentHandler: noop },
  { id: 'close-tab'   , label: 'close tab(s)', icon: 'delete', handler: closeTab   , contentHandler: noop },
];

const historyCommands = [
  { id: 'open-url'            , label: 'open'                  , icon: 'open'  , handler: openUrl         , contentHandler: noop },
  { id: 'open-urls-in-new-tab', label: 'open url(s) in new tab', icon: 'tab'   , handler: openUrlsInNewTab, contentHandler: noop },
  { id: 'delete-history'      , label: 'delete history(s)'     , icon: 'delete', handler: deleteHistory   , contentHandler: noop },
];

const bookmarkCommands = [
  { id: 'open-url'            , label: 'open'                   , icon: 'open'  , handler: openUrl         , contentHandler: noop },
  { id: 'open-urls-in-new-tab', label: 'open urls in new tab(s)', icon: 'tab'   , handler: openUrlsInNewTab, contentHandler: noop },
  { id: 'delete-bookmark'     , label: 'delete bookmark(s)'     , icon: 'delete', handler: deleteBookmark  , contentHandler: noop },
];

const cursorCommands = [
  { id: 'forward-char'        , label: 'Forward char'        , icon: null, handler: noop, contentHandler: cursor.forwardChar },
  { id: 'backward-char'       , label: 'Backward char'       , icon: null, handler: noop, contentHandler: cursor.backwardChar },
  { id: 'beginning-of-line'   , label: 'Beginning of line'   , icon: null, handler: noop, contentHandler: cursor.beginningOfLine },
  { id: 'end-of-line'         , label: 'End of line'         , icon: null, handler: noop, contentHandler: cursor.endOfLine },
  { id: 'next-line'           , label: 'Next line'           , icon: null, handler: noop, contentHandler: cursor.nextLine },
  { id: 'previous-line'       , label: 'Previous line'       , icon: null, handler: noop, contentHandler: cursor.previousLine },
  { id: 'end-of-buffer'       , label: 'End of buffer'       , icon: null, handler: noop, contentHandler: cursor.endOfBuffer },
  { id: 'beginning-of-buffer' , label: 'Beginning of buffer' , icon: null, handler: noop, contentHandler: cursor.beginningOfBuffer },
  { id: 'delete-backward-char', label: 'Delete backward char', icon: null, handler: noop, contentHandler: cursor.deleteBackwardChar },
  { id: 'kill-line'           , label: 'Kill line'           , icon: null, handler: noop, contentHandler: cursor.killLine },
];

const runCommands = [
  { id: 'run-command', label: 'run command', icon: null, handler: runCommand, contentHandler: noop },
];

export function command2Candidate(c) {
  if (!c) {
    return null;
  }
  return Object.assign({}, c, {
    id:         c.id,
    label:      c.label,
    type:       'command',
    faviconUrl: c.icon ? browser.extension.getURL(`images/${c.icon}.png`) : null,
  });
}

export function register(name, commands) {
  commandsOfType[name] = commands;
  commands.forEach((c) => {
    if (!commandList.find(v => v.id === c.id)) {
      commandList.push(c);
    }
  });
}

export function query(type = '', q = '') {
  const commands = commandsOfType[type] ? commandsOfType[type] : [];
  return commands.filter(c => c.label.includes(q)).map(command2Candidate);
}

export function find(id = '') {
  return command2Candidate(commandList.find(c => c.id === id));
}

export function init() {
  register('search'  , googleSearchCommands);
  register('link'    , linkCommands);
  register('tab'     , tabCommands);
  register('history' , historyCommands);
  register('bookmark', bookmarkCommands);
  register('cursor'  , cursorCommands);
  register('command' , runCommands);
}
