import browser from 'webextension-polyfill';
import { isExtensionUrl } from './utils/url';

export const POPUP_FRAME_ID = 'bebop-popup';
export const DEFAULT_POPUP_WIDTH = 700;
const POPUP_OPACITY = 0.85;

export function hasPopup() {
  return !!document.getElementById(POPUP_FRAME_ID);
}

function removePopup() {
  const previousPopup = document.getElementById(POPUP_FRAME_ID);
  if (previousPopup) {
    document.body.removeChild(previousPopup);
  }
}

export function messageListener(event) {
  if (isExtensionUrl(event.origin)) {
    const { type } = JSON.parse(event.data);
    if (type === 'CLOSE') {
      removePopup();
    }
  }
}

async function createPopup() {
  const popup = document.createElement('iframe');
  popup.src = browser.extension.getURL('popup/index.html');
  const { popupWidth } = await browser.storage.local.get('popupWidth');
  const w      = window.innerWidth - 100;
  const width  = Math.min(w, Number.popupWidth ? popupWidth : DEFAULT_POPUP_WIDTH);
  const height = window.innerHeight * 0.8;
  const left   = Math.round((window.innerWidth - width) * 0.5);
  const top    = Math.round((window.innerHeight - height) * 0.25);
  popup.id     = POPUP_FRAME_ID;
  popup.style.position        = 'fixed';
  popup.style.top             = `${top}px`;
  popup.style.left            = `${left}px`;
  popup.style.width           = `${width}px`;
  popup.style.height          = `${height}px`;
  popup.style.zIndex          = 10000000;
  popup.style.backgroundColor = `rgba(255, 255, 255, ${POPUP_OPACITY})`;
  popup.style.boxShadow       = '0 0 1em';
  return popup;
}

export async function toggle() {
  if (hasPopup()) {
    removePopup();
    return;
  }
  const popup = await createPopup();
  window.addEventListener('message', messageListener);
  if (document.activeElement) {
    document.activeElement.blur();
  }
  document.body.appendChild(popup);
}
