/* eslint-disable object-curly-newline, no-param-reassign */

import browser from 'webextension-polyfill';
import { requestArg } from './args';

export function cookie2candidate(cookie) {
  const { name, value, domain, path } = cookie;
  const id = `${name}-${value}-${domain}-${path}`;
  return {
    id,
    label:      `${name}:${value}`,
    type:       'cookie',
    args:       [name, value, cookie],
    faviconUrl: null,
  };
}

export async function fetch(url) {
  const cookies = await browser.cookies.getAll({ url });
  return cookies.map(cookie2candidate);
}

export const actions = [
  { id: 'change-value', label: 'change-value', type: 'action', args: [] },
  { id: 'remove-value', label: 'remove-value', type: 'action', args: [] },
];

function normalize(cookie, options) {
  delete cookie.hostOnly;
  delete cookie.session;
  return Object.assign({}, cookie, options);
}

async function changeValue(url, cookie) {
  const newValue = await requestArg({
    type:    'string',
    title:   'Enter new value',
    default: cookie.value,
  });
  return browser.cookies.set(normalize(cookie, { url, value: newValue }));
}

export async function manage(url) {
  const cookies = await fetch(url);
  const selectedCookies = await requestArg({
    type:  'object',
    title: 'Cookies in current page',
    enum:  cookies,
  });
  const [action] = await requestArg({
    type:  'object',
    title: 'Select an action',
    enum:  actions,
  });
  switch (action.id) {
    case 'change-value': {
      return changeValue(url, selectedCookies[0].args[2]);
    }
    case 'remove-value':
      return Promise.all(selectedCookies.map((c) => {
        const name = c.args[0];
        return browser.cookies.remove({ url, name });
      }));
    default:
      return null;
  }
}
