import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import getMessage from '../utils/i18n';

export default function candidates(q, { maxResults } = {}) {
  return browser.bookmarks.search({ query: q })
    .then(l => l.filter(v => v.type === 'bookmark').slice(0, maxResults).map(v => ({
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
