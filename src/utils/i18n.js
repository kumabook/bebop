import browser from 'webextension-polyfill';

export default function getMessage(key) {
  return browser.i18n.getMessage(key);
}
