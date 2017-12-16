import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import getMessage from '../utils/i18n';

export default function candidates(q, { maxResults } = {}) {
  const startTime = 0;
  return browser.history.search({ text: q, startTime, maxResults })
    .then(l => l.map(v => ({
      id:         `${v.id}`,
      label:      `${v.title}:${v.url}`,
      type:       'history',
      args:       [v.url],
      faviconUrl: getFaviconUrl(v.url),
    }))).then(items => ({
      items,
      label: `${getMessage('histories')} (:history or h)`,
    }));
}
