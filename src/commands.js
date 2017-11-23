import browser from 'webextension-polyfill';

const commands = [];

function filterContentCommands(q) {
  return commands
    .filter(n => n.includes(q))
    .map(name => ({
      id:   name,
      type: 'content',
      name,
    }));
}

function candidates(query) {
  const q = query.toLowerCase();
  return Promise.all([
    browser.history.search({ text: q, startTime: 0 }),
    Promise.resolve(filterContentCommands(q)),
  ]).then(([histories, commandItems]) => {
    const h = histories.map(v => ({
      id:   `${v.title}:${v.url}`,
      type: 'history',
      name: 'open-history',
      args: [v.url],
    }));
    const items = [{
      id:   `${q} － Search with Google`,
      type: 'search',
      name: 'google-search',
      args: [q],
    }];
    return items.concat(h).concat(commandItems);
  });
}

function googleSearch(query) {
  return browser.tabs.create({
    url: `https://www.google.com/search?q=${query}`,
  });
}

function open(url) {
  return browser.tabs.create({ url });
}

function execute(command, postCommandToContent) {
  const { id, type, args } = command;
  switch (type) {
    case 'content': {
      postCommandToContent(id);
      break;
    }
    case 'search':
      googleSearch.apply(this, args);
      break;
    case 'history':
      open.apply(this, args);
      break;
    default:
      break;
  }
}

export default {
  execute,
  candidates,
};
