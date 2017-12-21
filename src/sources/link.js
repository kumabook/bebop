import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import { sendMessageToActiveContentTab } from '../utils/tabs';
import getMessage from '../utils/i18n';

const linkMaxResults = 100;

export function faviconUrl(link) {
  if (link.role === 'link') {
    return getFaviconUrl(link.url);
  }
  return browser.extension.getURL('images/click.png');
}

export function getLabel(link) {
  const { url, label } = link;
  const l = label.trim();
  if (l && url) {
    return `${l}: ${url}`;
  }
  if (l) {
    return l;
  }
  return url;
}

export default function candidates(query, { maxResults } = {}) {
  return sendMessageToActiveContentTab({
    type:    'FETCH_LINKS',
    payload: {
      query,
      maxResults: linkMaxResults,
    },
  }).then(links => links.slice(0, maxResults).map((l) => {
    const { id } = l;
    return {
      id,
      label:      getLabel(l),
      type:       'link',
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
