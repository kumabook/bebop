import browser from 'webextension-polyfill';

export default function getMessage(key, substitutions = '') {
  return browser.i18n.getMessage(key, substitutions);
}
