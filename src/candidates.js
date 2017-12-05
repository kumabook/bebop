/* global URL: false */
import searchCandidates from './sources/search';
import linkCandidates from './sources/link';
import tabCandidates from './sources/tab';
import historyCandidates from './sources/history';
import bookmarkCandidates from './sources/bookmark';

let sources = [];

function getType(t) {
  const items = sources.filter(s => s.shorthand === t);
  if (items.length > 0) {
    return items[0].type;
  }
  return null;
}

export function parse(query) {
  let found;
  found = query.match(/^:(\w*)\s*(.*)/);
  if (found) {
    const [, type, value] = found;
    return { type, value };
  }
  found = query.match(/^(\w)\s+(.*)/);
  if (found) {
    const [, t, v] = found;
    const type = getType(t);
    const value = type ? v : query;
    return { type, value };
  }
  if (query.length === 1) {
    const type = getType(query);
    const value = type ? '' : query;
    return { type, value };
  }
  return { type: null, value: query };
}

function getSources(type) {
  if (type === null || type === '') {
    return sources;
  }
  return sources.filter(s => s.type === type);
}

export default function candidates(query) {
  const { type, value } = parse(query.toLowerCase());
  const ss = getSources(type);
  const options = ss.length > 1 ? {} : { maxResults: 100 };
  return Promise.all(ss.map(s => s.f(value, options)))
    .then(a => a.reduce((items, v) => items.concat(v), []));
}

export function init() {
  /* eslint-disable no-multi-spaces, comma-spacing */
  sources = [
    { type: 'search'  , shorthand: 's', f: searchCandidates },
    { type: 'link'    , shorthand: 'l', f: linkCandidates },
    { type: 'tab'     , shorthand: 't', f: tabCandidates },
    { type: 'history' , shorthand: 'h', f: historyCandidates },
    { type: 'bookmark', shorthand: 'b', f: bookmarkCandidates },
  ];
}
