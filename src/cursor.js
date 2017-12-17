import logger from 'kiroku';

export function cursor2position(lines, start) {
  let offset = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (start < offset + lines[i].length + 1) {
      return { x: start - offset, y: i };
    }
    offset += lines[i].length + 1;
  }
  return { x: 0, y: 0 };
}

export function position2cursor(lines, position) {
  const y = Math.max(0, Math.min(position.y, lines.length));
  const x = Math.max(0, Math.min(position.x, lines[y].length));
  let offset = 0;
  for (let i = 0; i < y; i += 1) {
    offset += lines[i].length + 1;
  }
  return offset + x;
}

export function forwardChar() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const pos = elem.selectionStart + 1;
  elem.setSelectionRange(pos, pos);
}

export function backwardChar() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const pos = elem.selectionStart - 1;
  elem.setSelectionRange(pos, pos);
}

export function nextLine() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const lines = elem.value.split('\n');
  const start = elem.selectionStart;
  const { x, y } = cursor2position(lines, start);
  const newPos = { x, y: y + 1 };
  const newStart = position2cursor(lines, newPos);
  logger.trace(`change start ${start} (${x}, ${y}) to ${newStart} (${newPos.x}, ${newPos.y})`);
  elem.setSelectionRange(newStart, newStart);
}

export function previousLine() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const lines = elem.value.split('\n');
  const start = elem.selectionStart;
  const { x, y } = cursor2position(lines, start);
  const newPos = { x, y: y - 1 };
  const newStart = position2cursor(lines, newPos);
  logger.trace(`change start ${start} (${x}, ${y}) to ${newStart} (${newPos.x}, ${newPos.y})`);
  elem.setSelectionRange(newStart, newStart);
}

export function endOfLine() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const lines = elem.value.split('\n');
  const start = elem.selectionStart;
  const { x, y } = cursor2position(lines, start);
  const newPos = { x: lines[y].length, y };
  const newStart = position2cursor(lines, newPos);
  logger.trace(`change start ${start} (${x}, ${y}) to ${newStart} (${newPos.x}, ${newPos.y})`);
  elem.setSelectionRange(newStart, newStart);
}

export function beginningOfLine() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const lines = elem.value.split('\n');
  const start = elem.selectionStart;
  const { x, y } = cursor2position(lines, start);
  const newPos = { x: 0, y };
  const newStart = position2cursor(lines, newPos);
  logger.trace(`change start ${start} (${x}, ${y}) to ${newStart} (${newPos.x}, ${newPos.y})`);
  elem.setSelectionRange(newStart, newStart);
}

export function endOfBuffer() {
  const elem = document.activeElement;
  if (elem && elem.value) {
    const end = elem.value.length - 1;
    elem.setSelectionRange(end, end);
  }
}

export function beginningOfBuffer() {
  const elem = document.activeElement;
  if (elem && elem.value) {
    elem.setSelectionRange(0, 0);
  }
}

export function deleteBackwardChar() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const v     = elem.value;
  const start = elem.selectionStart;
  elem.value = v.slice(0, start - 1) + v.slice(start, v.length);
  elem.setSelectionRange(start - 1, start - 1);
}

export function killLine() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return;
  }
  const lines = elem.value.split('\n');
  const start = elem.selectionStart;
  const { x, y } = cursor2position(lines, start);
  lines[y] = lines[y].slice(0, x);
  elem.value = lines.join('\n');
  const newPos = { x: lines[y].length, y };
  const newStart = position2cursor(lines, newPos);
  elem.setSelectionRange(newStart, newStart);
}

export function activeElementValue() {
  const elem = document.activeElement;
  if (!elem || !elem.value) {
    return '';
  }
  return elem.value;
}
