const characterMap = [];
characterMap[192] = '~';
characterMap[49]  = '!';
characterMap[50]  = '@';
characterMap[51]  = '#';
characterMap[52]  = '$';
characterMap[53]  = '%';
characterMap[54]  = '^';
characterMap[55]  = '&';
characterMap[56]  = '*';
characterMap[57]  = '(';
characterMap[48]  = ')';
characterMap[109] = '_';
characterMap[107] = '+';
characterMap[219] = '{';
characterMap[221] = '}';
characterMap[220] = '|';
characterMap[59]  = ':';
characterMap[222] = '\'';
characterMap[188] = '<';
characterMap[190] = '>';
characterMap[191] = '?';
characterMap[32]  = ' ';
characterMap[38]  = 'up';
characterMap[40]  = 'down';

export default function keySequence(keyEvent) {
  let code = String.fromCharCode(keyEvent.keyCode).toLowerCase();
  if (keyEvent.shiftKey) {
    if (keyEvent.keyCode >= 65 && keyEvent.keyCode <= 90) {
      code = code.toUpperCase();
    } else if (characterMap[keyEvent.keyCode]) {
      code = characterMap[keyEvent.keyCode];
    }
  } else if (characterMap[keyEvent.keyCode]) {
    code = characterMap[keyEvent.keyCode];
  }
  if (keyEvent.ctrlKey) {
    return `C-${code}`;
  } else if (keyEvent.metaKey) {
    return `M-${code}`;
  }
  return code;
}
