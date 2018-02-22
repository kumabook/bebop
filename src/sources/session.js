import { fetch, session2candidate } from '../utils/sessions';
import getMessage from '../utils/i18n';
import { includes } from '../utils/string';

export default function candidates(q, { maxResults } = {}) {
  const hasQuery = v => includes(v.label, q);
  return fetch(maxResults)
    .then(items => items.map(session2candidate).filter(hasQuery))
    .then(items => items.slice(0, maxResults))
    .then(items => ({
      items,
      label: `${getMessage('sessions')} (:session or s)`,
    }));
}
