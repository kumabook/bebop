/* global URL: false */
import searchCandidates from './sources/search';
import linkCandidates from './sources/link';
import tabCandidates from './sources/tab';
import historyCandidates from './sources/history';
import bookmarkCandidates from './sources/bookmark';
import commandCandidates from './sources/command';

export const MAX_RESULTS = 20;
export const MAX_RESULTS_FOR_SOLO = 100;
export const MAX_RESULTS_FOR_EMPTY = 5;
let sources = [];
let maxResultsForEmpty = {};

function getType(t) {
  const items = sources.filter(s => s.shorthand === t);
  if (items.length > 0) {
    return items[0].type;
  }
  return null;
}

function parseAsHasType(query) {
  const found = query.match(/^:(\w*)\s*(.*)/);
  if (found) {
    const [, type, value] = found;
    return { type, value };
  }
  return null;
}

function parseAsHasShorthand(query) {
  const found = query.match(/^(\w)\s+(.*)/);
  let type = null;
  let value = '';
  if (found) {
    const [, t, v] = found;
    type = getType(t);
    value = v;
  } else if (query.length === 1) {
    type = getType(query);
  }
  if (type) {
    return { type, value };
  }
  return null;
}

export function parse(query) {
  const hasType = parseAsHasType(query);
  if (hasType) {
    return hasType;
  }
  const hasShorthand = parseAsHasShorthand(query);
  if (hasShorthand) {
    return hasShorthand;
  }
  return { type: null, value: query };
}

function getSources(type) {
  if (type === null || type === '') {
    return sources;
  }
  return sources.filter(s => s.type === type);
}

function options({ type }, isEmpty, isSolo) {
  if (isSolo) {
    return { maxResults: MAX_RESULTS_FOR_SOLO };
  }
  if (isEmpty) {
    return { maxResults: MAX_RESULTS };
  }
  return { maxResults: maxResultsForEmpty[type] || MAX_RESULTS_FOR_EMPTY };
}

export default function search(query) {
  const { type, value } = parse(query.toLowerCase());
  const ss = getSources(type);
  const isEmpty = query.length > 0;
  const isSolo = ss.length === 1;
  return Promise.all(ss.map(s => s.f(value, options(s, isEmpty, isSolo))))
    .then(a => a.reduce((acc, v) => {
      if (v.items.length === 0) {
        return acc;
      }
      const { items, separators } = acc;
      return {
        items:      items.concat(v.items),
        separators: separators.concat({ label: v.label, index: items.length }),
      };
    }, { items: [], separators: [] }));
}

export function init({ orderOfCandidates: order, maxResultsForEmpty: nums } = {}) {
  sources = [{ type: 'search', shorthand: 's', f: searchCandidates }];
  /* eslint-disable no-multi-spaces, comma-spacing */
  const items = [
    { type: 'link'    , shorthand: 'l', f: linkCandidates },
    { type: 'tab'     , shorthand: 't', f: tabCandidates },
    { type: 'history' , shorthand: 'h', f: historyCandidates },
    { type: 'bookmark', shorthand: 'b', f: bookmarkCandidates },
    { type: 'command' , shorthand: 'c', f: commandCandidates },
  ];
  if (order) {
    sources = sources.concat(order.map(n => items.find(i => i.type === n)));
  } else {
    sources = sources.concat(items);
  }
  if (nums) {
    maxResultsForEmpty = nums;
  }
}
