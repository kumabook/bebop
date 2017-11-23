/* global browser: false */
const commands = [
  'forward-char',
  'backward-char',
  'beginning-of-line',
  'end-of-line',
  'next-line',
  'previous-line',
  'end-of-buffer',
  'beginning-of-buffer',
  'delete-backward-char',
];

export function search(query) {
  return browser.tabs.create({
    url: `https://www.google.com/search?q=${query}`,
  });
}

export default commands;
