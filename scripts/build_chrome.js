/*
 * Builds a Chrome (Manifest V3) package from the repository's
 * Firefox (Manifest V2) manifest.json and the webpack output.
 *
 * Output: web-ext-artifacts/bebop-chrome-<version>.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const stageDir = path.join(root, 'chrome-build');
const artifactsDir = path.join(root, 'web-ext-artifacts');

function toMV3(manifest) {
  const m = JSON.parse(JSON.stringify(manifest));
  m.manifest_version = 3;
  delete m.applications;
  m.minimum_chrome_version = '102';

  m.background = { service_worker: 'background/bundle.js' };

  const action = m.browser_action;
  delete m.browser_action;
  delete action.browser_style;
  delete action.theme_icons;
  m.action = action;

  m.host_permissions = m.permissions.filter(p => p === '<all_urls>');
  m.permissions = m.permissions.filter(p => p !== '<all_urls>');
  // chrome://favicon was removed in MV3; the _favicon endpoint needs this
  m.permissions.push('favicon');

  m.commands._execute_action = m.commands._execute_browser_action;
  delete m.commands._execute_browser_action;

  m.web_accessible_resources = [{
    resources: manifest.web_accessible_resources,
    matches:   ['<all_urls>'],
  }];
  return m;
}

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, filter) {
  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to, filter);
    } else if (!filter || filter(entry.name)) {
      copy(from, to);
    }
  });
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

fs.rmSync(stageDir, { recursive: true, force: true });
fs.mkdirSync(stageDir, { recursive: true });

const noSourceMap = name => !name.endsWith('.map') && !name.endsWith('~');
['background', 'content_scripts', 'popup', 'options_ui', 'icons', 'images', '_locales'].forEach((dir) => {
  copyDir(path.join(root, dir), path.join(stageDir, dir), noSourceMap);
});

fs.writeFileSync(
  path.join(stageDir, 'manifest.json'),
  `${JSON.stringify(toMV3(manifest), null, 2)}\n`,
);

fs.mkdirSync(artifactsDir, { recursive: true });
const zipPath = path.join(artifactsDir, `bebop-chrome-${manifest.version}.zip`);
fs.rmSync(zipPath, { force: true });
execSync(`zip -r -q ${JSON.stringify(zipPath)} .`, { cwd: stageDir });
process.stdout.write(`Chrome package is ready: ${zipPath}\n`);
