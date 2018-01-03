/* eslint-disable no-multi-spaces, comma-spacing */
import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

const commands = [
  { name: 'open-options'            , icon: 'options' },
  { name: 'go-forward'              , icon: 'forward' },
  { name: 'go-back'                 , icon: 'back' },
  { name: 'go-parent'               , icon: 'parent' },
  { name: 'go-root'                 , icon: 'root' },
  { name: 'reload'                  , icon: 'reload' },
  { name: 'add-bookmark'            , icon: 'bookmark' },
  { name: 'remove-bookmark'         , icon: 'bookmark' },
  { name: 'set-zoom'                , icon: 'zoom' },
  { name: 'restore-previous-session', icon: 'session' },
  { name: 'manage-cookies'          , icon: 'cookie' },
];

export default function candidates(q, { maxResults }) {
  const cs = commands.filter(c => c.name.includes(q)).slice(0, maxResults);
  return Promise.resolve(cs.map(c => ({
    id:         c.name,
    label:      c.name,
    type:       'command',
    args:       [c.name],
    faviconUrl: browser.extension.getURL(`images/${c.icon}.png`),
  }))).then(items => ({
    items,
    label: `${getMessage('commands')} (:command or c)`,
  }));
}
