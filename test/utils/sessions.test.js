import test from 'ava';
import nisemono from 'nisemono';
import { getFaviconUrl } from '../../src/utils/url';
import {
  session2candidate,
  restore,
  forget,
  restorePrevious,
} from '../../src/utils/sessions';

const tabSession = {
  tab: {
    sessionId: 1,
    title:     'tab-title',
    url:       'https://example.com',
    windowId:  1,
  },
};

const windowSession = {
  window: {
    sessionId: 2,
    tabs:      [
      {
        title: 'window-tab1-title',
        url:   'https://window-tab1-example.com',
      },
      {
        title: 'window-tab2-title',
        url:   'https://window-tab2-example.com',
      },
    ],
  },
};

const { browser } = global;
const {
  getRecentlyClosed,
  restore: restoreSession,
  forgetClosedTab,
  forgetClosedWindow,
} = browser.sessions;

test.beforeEach(() => {
  browser.sessions.getRecentlyClosed  = nisemono.func();
  browser.sessions.restore            = nisemono.func();
  browser.sessions.forgetClosedTab    = nisemono.func();
  browser.sessions.forgetClosedWindow = nisemono.func();
});

test.afterEach(() => {
  browser.sessions.getRecentlyClosed  = getRecentlyClosed;
  browser.sessions.restore            = restoreSession;
  browser.sessions.forgetClosedTab    = forgetClosedTab;
  browser.sessions.forgetClosedWindow = forgetClosedWindow;
});

test.serial('session2candidate converts session to candidate', (t) => {
  t.deepEqual(session2candidate(tabSession), {
    id:         'session-tab-1',
    label:      'tab-title:https://example.com',
    args:       [1, 'tab', 1],
    faviconUrl: getFaviconUrl(tabSession.tab.url),
    type:       'session',
  });

  t.deepEqual(session2candidate(windowSession), {
    id:         'session-window-2',
    label:      'window-tab1-title + 1 tabs',
    args:       [2, 'window'],
    faviconUrl: getFaviconUrl(windowSession.window.tabs[0].url),
    type:       'session',
  });
});

test.serial('restore calls browser.sessions.restore method', async (t) => {
  nisemono.expects(browser.sessions.restore).resolves();
  await restore([session2candidate(tabSession), session2candidate(windowSession)]);
  t.true(browser.sessions.restore.isCalled);
});

test.serial('forget calls forgetClosedTab or forgetClosedWindow method of browser.sessions', async (t) => {
  nisemono.expects(browser.sessions.forgetClosedTab).resolves();
  nisemono.expects(browser.sessions.forgetClosedWindow).resolves();
  await forget([session2candidate(tabSession), session2candidate(windowSession)]);
  t.true(browser.sessions.forgetClosedTab.isCalled);
  t.true(browser.sessions.forgetClosedWindow.isCalled);
});

test.serial('restorePrevious calls  browser.sessions.restore method for latest session', async (t) => {
  nisemono.expects(browser.sessions.getRecentlyClosed).resolves([tabSession, windowSession]);
  await restorePrevious();
  t.true(browser.sessions.getRecentlyClosed.calls.length === 1);

  nisemono.expects(browser.sessions.getRecentlyClosed).resolves([windowSession, tabSession]);
  await restorePrevious();
  t.true(browser.sessions.getRecentlyClosed.calls.length === 2);
});
