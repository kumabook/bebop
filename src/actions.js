/* eslint-disable no-multi-spaces, comma-spacing, object-curly-newline */
import browser from 'webextension-polyfill';
import isUrl from 'is-url';
import { click } from './link';
import * as cursor from './cursor';
import { getActiveContentTab } from './utils/tabs';
import { requestArg } from './utils/args';
import { manage as manageCookies } from './utils/cookies';
import {
  restorePrevious,
  restore as restoreSession,
  forget as forgetSession,
} from './utils/sessions';

const actionsOfType = {};
const actionList = [];
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
  return getActiveContentTab().then((tab) => {
    if (!url) {
      return Promise.resolve();
    }
    if (tab && EMPTY_URLS.includes(tab.url)) {
      return browser.tabs.update(tab.id, { url });
    }
    return browser.tabs.create({ url });
  });
}

export function openWindow(url, { incognito } = { incognito: false }) {
  return browser.windows.create({ url, incognito });
}

export function go(url) {
  return getActiveContentTab().then(tab => browser.tabs.update(tab.id, { url }));
}

export function openUrlsInNewTab(candidates) {
  return Promise.all(candidates.map(({ args }) => {
    if (isUrl(args[0])) {
      return open(args[0]);
    }
    return Promise.resolve();
  }));
}

export function openUrlsInNewWindow(candidates) {
  return openWindow(candidates.map(({ args }) => args[0]));
}

export function openUrlsInPrivateWindow(candidates) {
  return openWindow(candidates.map(({ args }) => args[0]), { incognito: true });
}

export function openUrl(candidates) {
  const candidate = candidates.find(c => isUrl(c.args[0]));
  if (candidate) {
    return go(candidate.args[0]);
  }
  return Promise.resolve();
}

export function openHatebuEntryPage(candidates) {
  const candidate = candidates.find(c => isUrl(c.args[0]));
  if (candidate) {
    const pageURL = new URL(candidate.args[0]);
    let hatenaPrefix = 'http://b.hatena.ne.jp/entry/';
    if (pageURL.protocol === 'https:') {
      hatenaPrefix += 's/';
    }
    const hatebuEntryPage = hatenaPrefix + pageURL.host + pageURL.pathname;
    return go(hatebuEntryPage);
  }
  return Promise.resolve();
}

export function clickLink(cs) {
  return Promise.all(filter(cs, 'link').map(({ args }) => click(args[0])));
}

function link2Url({ args }) {
  if (args[0] && isUrl(args[0].url)) {
    return { args: [args[0].url] };
  }
  return { args: [] };
}

export function openLinkInNewTab(candidates) {
  return openUrlsInNewTab(candidates.map(link2Url));
}

export function openLinkInNewWindow(candidates) {
  return openUrlsInNewWindow(candidates.map(link2Url));
}

export function openLinkInPrivateWindow(candidates) {
  return openUrlsInPrivateWindow(candidates.map(link2Url));
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
  return Promise.all(filter(cs, 'command').map(async ({ args }) => {
    const [name] = args;
    switch (name) {
      case 'open-options':
        return browser.runtime.openOptionsPage();
      case 'go-forward':
        return Promise.resolve();
      case 'go-back':
        return Promise.resolve();
      case 'go-root':
        return Promise.resolve();
      case 'go-parent':
        return Promise.resolve();
      case 'reload':
        return Promise.resolve();
      case 'add-bookmark':
        return getActiveContentTab()
          .then(({ title, url }) => browser.bookmarks.create({
            title,
            url,
          }));
      case 'remove-bookmark': {
        const { url } = await getActiveContentTab();
        const bs      = await browser.bookmarks.search({ url });
        return Promise.all(bs.map(b => browser.bookmarks.remove(b.id)));
      }
      case 'set-zoom': {
        const { id: tabId } = await getActiveContentTab();
        const zoom          = await browser.tabs.getZoom(tabId);
        const zoomFactor    = await requestArg({
          type:    'number',
          title:   'zoom factor',
          minimum: 0.3,
          maximum: 3,
          default: zoom,
        });
        return browser.tabs.setZoom(tabId, parseFloat(zoomFactor));
      }
      case 'restore-previous-session': {
        return restorePrevious();
      }
      case 'manage-cookies': {
        const { url } = await getActiveContentTab();
        return manageCookies(url);
      }
      default:
        return Promise.resolve();
    }
  }));
}

export function runCommandOnContent(cs) {
  return Promise.all(filter(cs, 'command').map(({ args }) => {
    const [name] = args;
    switch (name) {
      case 'go-forward':
        window.history.forward();
        break;
      case 'go-back':
        window.history.back();
        break;
      case 'go-root': {
        const { protocol, host } = window.location;
        window.location.href = `${protocol}//${host}`;
        break;
      }
      case 'go-parent': {
        window.location.href = `${window.location}/../`;
        break;
      }
      case 'reload':
        window.location.reload();
        break;
      default:
        break;
    }
    return Promise.resolve();
  }));
}

const googleSearchActions = [
  { id: 'search-with-google'           , label: 'search with google'           , icon: 'open', handler: searchWithGoogle        , contentHandler: noop },
  { id: 'search-with-google-in-new-tab', label: 'search with google in new tab', icon: 'tab' , handler: searchWithGoogleInNewTab, contentHandler: noop },
];

const linkActions = [
  { id: 'click'                      , label: 'click'                      , icon: 'click'  , handler: noop                   , contentHandler: clickLink },
  { id: 'open-link-in-new-tab'       , label: 'open link in new tab'       , icon: 'tab'    , handler: openLinkInNewTab       , contentHandler: noop },
  { id: 'open-link-in-new-window'    , label: 'open link in new window'    , icon: 'window' , handler: openLinkInNewWindow    , contentHandler: noop },
  { id: 'open-link-in-private-window', label: 'open link in private window', icon: 'private', handler: openLinkInPrivateWindow, contentHandler: noop },
];

const tabActions = [
  { id: 'activate-tab', label: 'activate tab', icon: 'tab'   , handler: activateTab, contentHandler: noop },
  { id: 'close-tab'   , label: 'close tab(s)', icon: 'delete', handler: closeTab   , contentHandler: noop },
];

const historyActions = [
  { id: 'open-url'                   , label: 'open'                         , icon: 'open'   , handler: openUrl                , contentHandler: noop },
  { id: 'open-urls-in-new-tab'       , label: 'open url(s) in new tab(s)'    , icon: 'tab'    , handler: openUrlsInNewTab       , contentHandler: noop },
  { id: 'open-urls-in-new-window'    , label: 'open url(s) in new window'    , icon: 'window' , handler: openUrlsInNewWindow    , contentHandler: noop },
  { id: 'open-urls-in-private-window', label: 'open url(s) in private window', icon: 'private', handler: openUrlsInPrivateWindow, contentHandler: noop },
  { id: 'delete-history'             , label: 'delete history(s)'            , icon: 'delete' , handler: deleteHistory          , contentHandler: noop },
];

const bookmarkActions = [
  { id: 'open-url'                   , label: 'open'                         , icon: 'open'   , handler: openUrl                , contentHandler: noop },
  { id: 'open-urls-in-new-tab'       , label: 'open url(s) in new tab(s)'    , icon: 'tab'    , handler: openUrlsInNewTab       , contentHandler: noop },
  { id: 'open-urls-in-new-window'    , label: 'open url(s) in new window'    , icon: 'window' , handler: openUrlsInNewWindow    , contentHandler: noop },
  { id: 'open-urls-in-private-window', label: 'open url(s) in private window', icon: 'private', handler: openUrlsInPrivateWindow, contentHandler: noop },
  { id: 'delete-bookmark'            , label: 'delete bookmark(s)'           , icon: 'delete' , handler: deleteBookmark         , contentHandler: noop },
];

const hatebuActions = [
  { id: 'open-url'                   , label: 'open'                         , icon: 'open'   , handler: openUrl                , contentHandler: noop },
  { id: 'open-urls-in-new-tab'       , label: 'open url(s) in new tab(s)'    , icon: 'tab'    , handler: openUrlsInNewTab       , contentHandler: noop },
  { id: 'open-urls-in-new-window'    , label: 'open url(s) in new window'    , icon: 'window' , handler: openUrlsInNewWindow    , contentHandler: noop },
  { id: 'open-urls-in-private-window', label: 'open url(s) in private window', icon: 'private', handler: openUrlsInPrivateWindow, contentHandler: noop },
  { id: 'edit-bookmark'              , label: 'edit bookmark(s)'             , icon: 'open'   , handler: openHatebuEntryPage    , contentHandler: noop },
];

const sessionActions = [
  { id: 'restore-session', label: 'restore-session', icon: 'session', handler: restoreSession },
];

if (browser.sessions && browser.sessions.forgetClosedTab) {
  sessionActions.push({ id: 'forget-session' , label: 'forget-session' , icon: 'session', handler: forgetSession });
}

const cursorActions = [
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

const commandActions = [
  { id: 'run-command', label: 'run command', icon: 'command', handler: runCommand, contentHandler: runCommandOnContent },
];

export function action2Candidate(c) {
  if (!c) {
    return null;
  }
  return Object.assign({}, c, {
    id:         c.id,
    label:      c.label,
    type:       'action',
    faviconUrl: c.icon ? browser.extension.getURL(`images/${c.icon}.png`) : null,
  });
}

export function register(name, actions) {
  actionsOfType[name] = actions;
  actions.forEach((c) => {
    if (!actionList.find(v => v.id === c.id)) {
      actionList.push(c);
    }
  });
}

export function query(type = '', q = '') {
  const actions = actionsOfType[type] ? actionsOfType[type] : [];
  return actions.filter(c => c.label.includes(q)).map(action2Candidate);
}

export function find(id = '') {
  return action2Candidate(actionList.find(c => c.id === id));
}

export function init() {
  register('search'  , googleSearchActions);
  register('link'    , linkActions);
  register('tab'     , tabActions);
  register('history' , historyActions);
  register('bookmark', bookmarkActions);
  register('hatebu'  , hatebuActions);
  register('session' , sessionActions);
  register('cursor'  , cursorActions);
  register('command' , commandActions);
}
