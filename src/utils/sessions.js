import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';

const { MAX_SESSION_RESULTS } = browser.sessions;

export function session2candidate(session) {
  const { tab, window } = session;
  if (tab) {
    return {
      id:         `session-tab-${tab.sessionId}`,
      label:      `${tab.title}:${tab.url}`,
      type:       'session',
      args:       [tab.sessionId, 'tab', tab.windowId],
      faviconUrl: getFaviconUrl(tab.url),
    };
  }
  const t = window.tabs[0];
  const title = `${t.title} + ${window.tabs.length - 1} tabs`;
  return {
    id:         `session-window-${window.sessionId}`,
    label:      title,
    type:       'session',
    args:       [window.sessionId, 'window'],
    faviconUrl: getFaviconUrl(t.url),
  };
}

export function fetch(maxResults = MAX_SESSION_RESULTS) {
  return browser.sessions.getRecentlyClosed({
    maxResults: Math.min(maxResults, MAX_SESSION_RESULTS),
  });
}

export function restore(candidates) {
  return Promise.all(candidates.map((candidate) => {
    const sessionId = candidate.args[0];
    return browser.sessions.restore(sessionId);
  }));
}

export function forget(candidates) {
  return Promise.all(candidates.map((candidate) => {
    const sessionId = candidate.args[0];
    if (candidate.args[1] === 'tab') {
      return browser.sessions.forgetClosedTab(candidate.args[2], sessionId);
    }
    return browser.sessions.forgetClosedWindow(sessionId);
  }));
}

export async function restorePrevious() {
  const [session] = await fetch();
  if (session.tab) {
    return browser.sessions.restore(session.tab.sessionId);
  }
  return browser.sessions.restore(session.window.sessionId);
}
