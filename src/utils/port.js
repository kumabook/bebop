/* global browser: false */

import { eventChannel } from 'redux-saga';

const ports = {};

const createDummyPort = () => ({
  postMessage: ({ type }) => {
    console.log(`post message: ${type}`);
  },
  onMessage: {
    addEventListener:    () => {},
    removeEventListener: () => {},
  },
});


export function createPortChannel(p) {
  return eventChannel((emit) => {
    const messageHandler = (event) => {
      emit(event);
    };
    p.onMessage.addListener(messageHandler);
    const removeEventListener = () => {
      p.onMessage.removeListener(messageHandler);
    };
    return removeEventListener;
  });
}

export function getPort(name) {
  if (ports[name]) {
    return ports[name];
  }
  if (typeof browser === 'undefined') {
    const port = createDummyPort();
    ports[name] = port;
    return port;
  }
  const port = browser.runtime.connect({ name });
  ports[name] = port;
  return port;
}
