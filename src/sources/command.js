import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

const commands = [
  { name: 'open-options' },
];

export default function candidates(q, { maxResults }) {
  const cs = commands.filter(c => c.name.includes(q)).slice(0, maxResults);
  return Promise.resolve(cs.map(c => ({
    id:         c.name,
    label:      c.name,
    type:       'command',
    args:       [c.name],
    faviconUrl: browser.extension.getURL('images/command.png'),
  }))).then(items => ({
    items,
    label: `${getMessage('commands')} (:command or c)`,
  }));
}
