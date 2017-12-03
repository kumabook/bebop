import browser from 'webextension-polyfill';
import { eventChannel } from 'redux-saga';

const ports = {};

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
  const port = browser.runtime.connect({ name });
  ports[name] = port;
  return port;
}
