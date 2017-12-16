import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import getMessage from '../utils/i18n';

export default function candidates(q, { maxResults } = {}) {
  if (q.length === 0) {
    return Promise.resolve({ items: [], label: 'Bookmarks' });
  }
  return browser.bookmarks.search({ query: q })
    .then(l => l.slice(0, maxResults).map(v => ({
      id:         `${v.id}`,
      label:      `${v.title}:${v.url}`,
      type:       'bookmark',
      args:       [v.url, v.id],
      faviconUrl: getFaviconUrl(v.url),
    }))).then(items => ({
      items,
      label: `${getMessage('bookmarks')} (:bookmark or b)`,
    }));
}
