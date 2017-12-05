import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';

export default function candidates(q, { maxResults = 20 } = {}) {
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
