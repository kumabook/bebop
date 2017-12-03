import test from 'ava';
import {
  cursor2position,
  activeElementValue,
  forwardChar,
  backwardChar,
  nextLine,
  previousLine,
  endOfLine,
  beginningOfLine,
  endOfBuffer,
  beginningOfBuffer,
  deleteBackwardChar,
} from '../src/cursor';


function setInputElement(text) {
  const { document } = window;
  const input = `<textarea id="input" type="text">${text}</textarea>`;
  document.body.innerHTML = input;
}

function getInputElement() {
  const { document } = window;
  return document.getElementById('input');
}

test('cursor.activeElementValue returns focused input value', (t) => {
  setInputElement('abcdefg');
  const elem = getInputElement();
  elem.focus();
  elem.setSelectionRange(0, 0);
  t.is(elem.id, 'input');
  t.is(activeElementValue(), 'abcdefg');
  t.is(window.document.activeElement.selectionStart, 0);
});

test('cursor.cursor2position returns a position from cursor', (t) => {
  const lines = '1234\n5678\nabcd'.split('\n');
  t.deepEqual(cursor2position(lines, 0), { x: 0, y: 0 });
  t.deepEqual(cursor2position(lines, 1), { x: 1, y: 0 });
  t.deepEqual(cursor2position(lines, 4), { x: 4, y: 0 });
  t.deepEqual(cursor2position(lines, 5), { x: 0, y: 1 });
  t.deepEqual(cursor2position(lines, 6), { x: 1, y: 1 });

  t.deepEqual(cursor2position([], 0), { x: 0, y: 0 });
});

test('move functions change cursor', (t) => {
  setInputElement('abcd\n1234');
  const elem = getInputElement();
  elem.focus();
  elem.setSelectionRange(0, 0);
  t.is(elem.selectionStart, 0);
  forwardChar();
  t.is(elem.selectionStart, 1);
  backwardChar();
  t.is(elem.selectionStart, 0);
  nextLine();
  t.is(elem.selectionStart, 5);
  previousLine();
  t.is(elem.selectionStart, 0);
  endOfLine();
  t.is(elem.selectionStart, 4);
  beginningOfLine();
  t.is(elem.selectionStart, 0);
  endOfBuffer();
  t.is(elem.selectionStart, 8);
  beginningOfBuffer();
  t.is(elem.selectionStart, 0);
});

test('deleteBackwardChar removes previous character', (t) => {
  setInputElement('abcd\n1234');
  const elem = getInputElement();
  elem.focus();
  elem.setSelectionRange(1, 1);
  deleteBackwardChar();
  t.is(elem.value, 'bcd\n1234');
});
