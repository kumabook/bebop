import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

function isCandidate(tab, q) {
  const { title: t, url: u } = tab;
  return (t.includes(q) || u.includes(q)) &&
    !(u.startsWith('moz-extension') || u.startsWith('chrome-extension'));
}

export default function candidates(q, { maxResults }) {
  return browser.tabs.query({})
    .then((l) => {
      const items = l.filter(t => isCandidate(t, q));
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
