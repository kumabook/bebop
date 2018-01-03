import test from 'ava';
import nisemono from 'nisemono';
import { getArgListener } from '../../src/utils/args';
import {
  cookie2candidate,
  manage,
  actions,
} from '../../src/utils/cookies';

const WAIT_MS = 10;
const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));
const { browser } = global;
const {
  getAll,
  set,
  remove,
} = browser.cookies;

test.beforeEach(() => {
  browser.cookies.getAll = nisemono.func();
  browser.cookies.set    = nisemono.func();
  browser.cookies.remove = nisemono.func();
});

test.afterEach(() => {
  browser.cookies.getAll = getAll;
  browser.cookies.set    = set;
  browser.cookies.remove = remove;
});

const cookie = {
  name:     'name',
  value:    'value',
  domain:   'example.com',
  hostOnly: false,
  path:     '/',
  secure:   true,
  httpOnly: false,
  storeId:  1,
};

const [changeAction, removeAction] = actions;

test.serial('cookie2candidate converts cookie to candidate', (t) => {
  t.deepEqual(cookie2candidate(cookie), {
    id:         'name-value-example.com-/',
    label:      'name:value',
    args:       ['name', 'value', cookie],
    faviconUrl: null,
    type:       'cookie',
  });
});

test.serial('manage(): remove action', async (t) => {
  nisemono.expects(browser.cookies.getAll).resolves([cookie]);
  manage('http://example.com');
  await delay(WAIT_MS);
  getArgListener()([cookie2candidate(cookie)]);
  await delay(WAIT_MS);
  getArgListener()([removeAction]);
  await delay(WAIT_MS);
  t.true(browser.cookies.remove.isCalled);
});


test.serial('manage(): change action', async (t) => {
  nisemono.expects(browser.cookies.getAll).resolves([cookie]);
  manage('http://example.com');
  await delay(WAIT_MS);
  getArgListener()([cookie2candidate(cookie)]);
  await delay(WAIT_MS);
  getArgListener()([changeAction]);
  await delay(WAIT_MS);
  getArgListener()('new-value');
  await delay(WAIT_MS);
  t.true(browser.cookies.set.isCalled);
});

test.serial('manage(): unknown action', async (t) => {
  nisemono.expects(browser.cookies.getAll).resolves([cookie]);
  manage('http://example.com');
  await delay(WAIT_MS);
  getArgListener()([cookie2candidate(cookie)]);
  await delay(WAIT_MS);
  getArgListener()([{}]);
  await delay(WAIT_MS);
  t.false(browser.cookies.set.isCalled);
  t.false(browser.cookies.remove.isCalled);
});
