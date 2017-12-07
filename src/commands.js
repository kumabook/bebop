import browser from 'webextension-polyfill';
import { click } from './link';
import * as cursor from './cursor';
import { getActiveTab } from './utils/tabs';

const commands = {};
const EMPTY_URLS = ['about:newtab', 'about:blank'];

const noop = () => Promise.resolve();

export function activateTab(tabId) {
  browser.tabs.update(tabId, { active: true });
}

export function open(url) {
  return getActiveTab().then((tab) => {
    if (tab && EMPTY_URLS.includes(tab.url)) {
      return browser.tabs.update(tab.id, { url });
    }
    return browser.tabs.create({ url });
  });
}

export function googleSearch(query) {
  return open(`https://www.google.com/search?q=${query}`);
}

export function register(name, backgroundHandler, contentHandler) {
  commands[name] = {
    name,
    backgroundHandler,
    contentHandler,
  };
}

export function get(name) {
  return commands[name];
}

export function init() {
  /* eslint-disable no-multi-spaces, comma-spacing */
  register('google-search', googleSearch, noop);
  register('open-link'    , noop        , click);
  register('activate-tab' , activateTab , noop);
  register('open-history' , open        , noop);
  register('open-bookmark', open        , noop);

  register('forward-char'        , noop, cursor.forwardChar);
  register('backward-char'       , noop, cursor.backwardChar);
  register('beginning-of-line'   , noop, cursor.beginningOfLine);
  register('end-of-line'         , noop, cursor.endOfLine);
  register('next-line'           , noop, cursor.nextLine);
  register('previous-line'       , noop, cursor.previousLine);
  register('end-of-buffer'       , noop, cursor.endOfBuffer);
  register('beginning-of-buffer' , noop, cursor.beginningOfBuffer);
  register('delete-backward-char', noop, cursor.deleteBackwardChar);
}
