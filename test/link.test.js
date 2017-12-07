import test from 'ava';
import {
  HIGHLIGHTER_ID,
  LINK_MARKER_CLASS,
  getTargetElements,
  search,
  createHighlighter,
  highlight,
  dehighlight,
  click,
} from '../src/link';

const style = 'style="height: 10px;"';

function a(url, text, title = '') {
  return `<a href="${url}" title="${title}" ${style}>${text}</a>`;
}

function button(text, title) {
  return `<button title="${title}" ${style}>${text}</button>`;
}

function input(type, value) {
  return `<input type="${type}" value="${value}" ${style}>`;
}

function div(role, ariaLabel) {
  return `<div role="${role}" aria-label="${ariaLabel}" ${style}/>`;
}

function setup() {
  const { document } = window;
  const container = document.getElementById('container');
  const links = [
    a('https://example.org/', 'normal link'),
    a('/relative', 'relative link'),
    a('//outside.com/', 'no protocol link'),
    a('#', 'some action'),
    a('https://example.org/', '', 'title'),
    button('text', 'title'),
    button('', 'title'),
    input('button', 'input button'),
    input('submit', 'input submit'),
    div('button', 'aria-label'),
  ];
  container.innerHTML = links.join('\n');
}

test.beforeEach(setup);
test.afterEach(dehighlight);

test('getTargetElements returns visible and clickable links', (t) => {
  setup();
  const targets = getTargetElements();
  t.is(targets.length, 10);
});

test('search returns visible and clickable links', (t) => {
  setup();
  const candidates = search();
  t.is(candidates.length, 10);
  t.deepEqual(candidates[0], {
    id:    'link-0',
    index: 0,
    url:   'https://example.org/',
    label: 'normal link',
    role:  'link',
  });
  t.deepEqual(candidates[1], {
    id:    'link-1',
    index: 1,
    url:   'https://example.org/relative',
    label: 'relative link',
    role:  'link',
  });
  t.deepEqual(candidates[2], {
    id:    'link-2',
    index: 2,
    url:   'https://outside.com/',
    label: 'no protocol link',
    role:  'link',
  });
  t.deepEqual(candidates[3], {
    id:    'link-3',
    index: 3,
    url:   '',
    label: 'some action',
    role:  'button',
  });
  t.deepEqual(candidates[4], {
    id:    'link-4',
    index: 4,
    url:   'https://example.org/',
    label: 'title',
    role:  'link',
  });
  t.deepEqual(candidates[5], {
    id:    'link-5',
    index: 5,
    url:   '',
    label: 'text',
    role:  'button',
  });
  t.deepEqual(candidates[6], {
    id:    'link-6',
    index: 6,
    url:   '',
    label: 'title',
    role:  'button',
  });
  t.deepEqual(candidates[7], {
    id:    'link-7',
    index: 7,
    url:   '',
    label: 'input button',
    role:  'button',
  });
  t.deepEqual(candidates[8], {
    id:    'link-8',
    index: 8,
    url:   '',
    label: 'input submit',
    role:  'button',
  });
  t.deepEqual(candidates[9], {
    id:    'link-9',
    index: 9,
    url:   '',
    label: 'aria-label',
    role:  'button',
  });
});

test('createHighlighter returns highter element', (t) => {
  t.truthy(createHighlighter({
    left:   10,
    top:    10,
    width:  10,
    height: 10,
  }));
});

test('highlight appends highlight element and link markers', (t) => {
  setup();
  highlight({ index: 0, url: 'https://example.org/' });
  t.truthy(document.getElementById(HIGHLIGHTER_ID));
  t.true(document.getElementsByClassName(LINK_MARKER_CLASS).length === 10);
});

test('dehighlight removes highlight element and link markers', (t) => {
  setup();
  highlight({ index: 0, url: 'https://example.org/' });
  dehighlight();
  t.falsy(document.getElementById(HIGHLIGHTER_ID));
  t.true(document.getElementsByClassName(LINK_MARKER_CLASS).length === 0);
});

test('click triggers target element click', (t) => {
  setup();
  click({ index: 0, url: 'https://example.org/' });
  click({ index: 1, url: 'https://example.org/relative' });
  t.pass();
});
