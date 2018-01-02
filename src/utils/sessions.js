import browser from 'webextension-polyfill';

export function fetch(maxResults = browser.sessions.MAX_SESSION_RESULTS) {
  return browser.sessions.getRecentlyClosed({ maxResults });
}

export async function restorePrevious() {
  const [session,] = await fetch();
  if (session.tab) {
    return browser.sessions.restore(session.tab.sessionId);
  } else {
    return browser.sessions.restore(session.window.sessionId);
  }
}
