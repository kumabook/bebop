import browser from 'webextension-polyfill';

export const HIGHLIGHTER_ID    = 'bebop-highlighter';
export const LINK_MARKER_CLASS = 'bebop-link-marker';
const MARKER_SIZE = 12;

const SELECTOR = [
  'a',
  'button',
  'input[type="button"]',
  'input[type="submit"]',
  '[role="button"]',
].join(',');

const dummyHrefs = [
  '#',
  'javascirpt:void(0);',
  './',
];

export function getTargetElements() {
  const elements = document.querySelectorAll(SELECTOR);
  return Array.prototype.filter.call(elements, (e) => {
    const style = window.getComputedStyle(e);
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      e.type !== 'hidden' &&
      e.offsetHeight > 0;
  });
}

export function getButtonLabel(element) {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }
  if (element.textContent) {
    return element.textContent;
  }
  return element.title;
}

export function getAnchorUrl(element) {
  const href = element.getAttribute('href');
  if (dummyHrefs.includes(href)) {
    return '';
  }
  return element.href;
}

export function getAnchorLabel(element) {
  const { text, title } = element;
  const txt = text.trim();
  if (txt) {
    return txt;
  }
  const t = title.trim();
  return t;
}

function buttonLink(element, id, index) {
  return {
    id,
    url:   element.target || '',
    label: getButtonLabel(element),
    role:  'button',
    index,
  };
}

function inputLink(element, id, index) {
  return {
    id,
    url:   element.target || '',
    label: element.value,
    role:  'button',
    index,
  };
}

function anchorLink(element, id, index) {
  const url = getAnchorUrl(element);
  return {
    id,
    url,
    label: getAnchorLabel(element),
    role:  url ? 'link' : 'button',
    index,
  };
}

export function elem2Link(element, index) {
  const id = `link-${index}`;
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  if (role === 'button' || tagName === 'button') {
    return buttonLink(element, id, index);
  }
  if (tagName === 'input') {
    return inputLink(element, id, index);
  }
  return anchorLink(element, id, index);
}

export function search({ query = '', maxResults = 20 } = {}) {
  return getTargetElements().map(elem2Link).filter((l) => {
    const url = l.url.toLowerCase();
    const label = l.label.toLowerCase();
    return url.includes(query) || label.includes(query);
  }).slice(0, maxResults);
}

export function click({ index, url } = {}) {
  const elements = getTargetElements();
  for (let i = 0, len = elements.length; i < len; i += 1) {
    const e = elements[i];
    const l = elem2Link(e, i);
    const selected = i === index && l.url === url;
    if (selected) {
      e.click();
      return;
    }
  }
}

export function createHighlighter(rect) {
  const {
    left,
    top,
    width,
    height,
  } = rect;
  const e = document.createElement('div');
  e.id = HIGHLIGHTER_ID;
  e.style.position = 'absolute';
  e.style.top      = `${top}px`;
  e.style.left     = `${left}px`;
  e.style.width    = `${width}px`;
  e.style.height   = `${height}px`;
  e.style.border   = 'dashed 2px #FF8C00';
  e.style.zIndex   = 1000000;
  e.style.backgroundColor = '#FF8C0055';
  return e;
}

function createLinkMarker({ left, top }, selected) {
  const e = document.createElement('img');
  e.src = browser.extension.getURL('images/link.png');
  e.className      = LINK_MARKER_CLASS;
  e.style.position = 'absolute';
  e.style.display  = 'block';
  e.style.top      = `${top - (MARKER_SIZE * 0.5)}px`;
  e.style.left     = `${left - MARKER_SIZE}px`;
  e.style.width    = `${MARKER_SIZE}px`;
  e.style.height   = `${MARKER_SIZE}px`;
  e.style.zIndex   = 1000000;
  e.style.padding  = '2px';
  e.style.backgroundColor = selected ? '#FF8C00' : '#ADFF2F';
  e.borderRadius   = '5px';
  return e;
}

function removeHighlighter() {
  const e = document.getElementById(HIGHLIGHTER_ID);
  if (e) {
    e.parentNode.removeChild(e);
  }
}

function removeLinkMarkers() {
  const elements = document.getElementsByClassName(LINK_MARKER_CLASS);
  for (let i = elements.length - 1; i >= 0; i -= 1) {
    elements[i].parentNode.removeChild(elements[i]);
  }
}

function getContainerDisplayedRect() {
  const {
    pageXOffset,
    pageYOffset,
    innerHeight,
    innerWidth,
  } = window;
  return {
    left:   pageXOffset,
    right:  pageXOffset + innerWidth,
    top:    pageYOffset,
    bottom: pageYOffset + innerHeight,
  };
}

function getElementRect(element) {
  const rect = element.getBoundingClientRect();
  const left = rect.left + window.pageXOffset;
  const top  = rect.top + window.pageYOffset;
  return {
    left,
    top,
    width:  rect.width,
    height: rect.height,
  };
}

function isDisplayed(container, rect) {
  return container.left <= rect.left && rect.left <= container.right &&
    container.top <= rect.top && rect.top <= container.bottom;
}

export function highlight({ index, url } = {}) {
  const containerRect = getContainerDisplayedRect();
  const elements      = getTargetElements();
  elements.forEach((elem, i) => {
    const rect        = getElementRect(elem);
    const link        = elem2Link(elem, i);
    const selected    = i === index && link.url === url;
    if (selected || isDisplayed(containerRect, rect)) {
      const marker = createLinkMarker(rect, selected);
      document.body.appendChild(marker);
    }
    if (selected) {
      const highlighter = createHighlighter(rect);
      document.body.appendChild(highlighter);
      elem.scrollIntoView({ block: 'end' });
    }
  });
}

export function dehighlight() {
  removeHighlighter();
  removeLinkMarkers();
}
