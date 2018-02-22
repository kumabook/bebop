import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';
import { isExtensionUrl } from '../utils/url';
import { includes } from '../utils/string';

function isCandidate(tab, q) {
  const { title: t, url: u } = tab;
  return (includes(t, q) || includes(u, q)) && !isExtensionUrl(u);
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
