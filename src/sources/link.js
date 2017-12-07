import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import { sendMessageToActiveTab } from '../utils/tabs';
import getMessage from '../utils/i18n';

const linkMaxResults = 100;

function faviconUrl(link) {
  if (link.role === 'link') {
    return getFaviconUrl(link.url);
  }
  return browser.extension.getURL('images/click.png');
}

export default function candidates(query, { maxResults = 20 } = {}) {
  return sendMessageToActiveTab({
    type:    'FETCH_LINKS',
    payload: {
      query,
      maxResults: linkMaxResults,
    },
  }).then(links => links.slice(0, maxResults).map((l) => {
    const { id } = l;
    return {
      id,
      label:      `${l.label}: ${l.url}`,
      type:       'link',
      name:       'open-link',
      args:       [l],
      faviconUrl: faviconUrl(l),
    };
  }))
    .catch(() => [])
    .then(items => ({
      items,
      label: `${getMessage('links')} (:link or l)`,
    }));
}
