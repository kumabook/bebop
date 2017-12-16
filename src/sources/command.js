import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

const commands = [
  { name: 'open-options' },
];

export default function candidates(q) {
  return Promise.resolve(commands.filter(c => c.name.includes(q)).map(c => ({
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
