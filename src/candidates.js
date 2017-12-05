/* global URL: false */
import searchCandidates from './sources/search';
import linkCandidates from './sources/link';
import tabCandidates from './sources/tab';
import historyCandidates from './sources/history';
import bookmarkCandidates from './sources/bookmark';

let sources = [];

export default function candidates(query) {
  const q = query.toLowerCase();
  return Promise.all(sources.map(f => f(q)))
    .then(list => list.reduce((items, v) => items.concat(v), []));
}

export function init() {
  sources = [
    searchCandidates,
    linkCandidates,
    tabCandidates,
    historyCandidates,
    bookmarkCandidates,
  ];
}
