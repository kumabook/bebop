import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

export default function candidates(q, { maxResults }) {
  return browser.tabs.query({})
    .then((l) => {
      const items = l.filter(t => t.title.includes(q) || t.url.includes(q));
      return items.slice(0, maxResults).map(t => ({
        id:         `${t.id}`,
        label:      `${t.title}: ${t.url}`,
        type:       'tab',
        args:       [t.id, t.windowId],
        faviconUrl: t.favIconUrl,
      }));
    }).then(items => ({
      items,
      label: `${getMessage('tabs')} (:tab or t)`,
    }));
}
