import { fetch, session2candidate } from '../utils/sessions';
import getMessage from '../utils/i18n';

export default function candidates(q, { maxResults } = {}) {
  return fetch(maxResults)
    .then(items => items.map(session2candidate)
                        .filter(item => item.label.includes(q))
                        .slice(0, maxResults))
    .then(items => ({
      items,
      label: `${getMessage('sessions')} (:session or s)`,
    }));
}
