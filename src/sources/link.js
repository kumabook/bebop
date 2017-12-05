import { getFaviconUrl } from '../utils/url';
import { sendMessageToActiveTab } from '../utils/tabs';

const linkMaxResults = 100;

export default function candidates(query, { maxResults = 20 } = {}) {
  return sendMessageToActiveTab({
    type:    'FETCH_LINKS',
    payload: {
      query,
      maxResults: linkMaxResults,
    },
  }).then(links => links.slice(0, maxResults).map(l => ({
    id:         `content-link-${l.id}`,
    label:      `${l.label}: ${l.url}`,
    type:       'link',
    name:       'open-link',
    args:       [l],
    faviconUrl: getFaviconUrl(l.url),
  }))).catch(() => []);
}
