import test from 'ava';
import { createPortChannel, getPort } from '../../src/utils/port';

test.cb('createPortChannel returns new port channel', (t) => {
  let listener;
  const port = {
    onMessage: {
      addListener: (l) => {
        listener = l;
      },
      removeListener: (l) => {
        if (l === listener) {
          listener = null;
        }
      },
    },
  };
  const channel = createPortChannel(port);
  t.not(listener, null);
  t.not(channel, null);
  channel.take(() => {
    t.end();
  });
  listener('event');

  channel.close();
  t.is(listener, null);
});

test('getPort returns connected port', (t) => {
  const port = getPort('popup');
  t.is(port, getPort('popup'));
});
