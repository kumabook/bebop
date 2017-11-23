import browser from 'webextension-polyfill';

export function getMessage(key) {
  if (typeof browser === 'undefined') {
    return key;
  }
  return browser.i18n.getMessage(key);
}
