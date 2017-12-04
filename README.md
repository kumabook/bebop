bebop
=====

[![Build Status](https://travis-ci.org/kumabook/bebop.svg?branch=master)](https://travis-ci.org/kumabook/bebop)
[![Coverage Status](https://coveralls.io/repos/github/kumabook/bebop/badge.svg?branch=master)](https://coveralls.io/github/kumabook/bebop?branch=master)

About
-----

bebop is a webextension that offers
emacs key-bindings and command line interface like
[emacs helm](https://github.com/emacs-helm/helm) for browsing.


Usage
-----

## command

1. `Click icon on toolbar` or `Ctrl+Comma` ... snow popup that has command input
2. Input a query to narrow down the commands.

| type        | description                     |
|:------------|:------------------------------- |
| search      | open new tab with google search |
| link        | click a link in current page    |
| tab         | active selected tab             |
| history     | open a history                  |
| bookmark    | open a bookmark                 |

You can change shortcut key. See [Customize](#change-shortcut-key-with-your-own-private-addon)

## emacs key-bindings on textarea (except mac)

You can edit with key-bindings in text input of html (not browser native-ui):

| key-binding | command              |
|:------------|:-------------------- |
| C-f         | forward-char         |
| C-b         | backward-char        |
| C-a         | beginning-of-line    |
| C-e         | end-of-line          |
| C-n         | next-line            |
| C-p         | previous-line        |
| M->         | end-of-buffer        |
| M-<         | beginning-of-buffer  |
| C-h         | delete-backward-char |

macOS provides emacs key-bindings for text editing.
So this extension does nothing on macOS.


## Customize

### Change popup width from addon-setting page

Change popup width from `Add-ons` -> `Extensions` -> `Preferences` of `bebop`.


### Change shortcut key

#### Chrome: Extensions page

1. Open `chrome://extensions/`
2. Click `Keyboard shortcuts` at thxe bottom of the page
3. Set `Activate the extension` as your favorite shortcut key

#### Firefox: Change shortcut key with your own private addon

You can change the shourcut key if you build and upload the addon as your own private addon.

1. Clone this repository

```sh
git clone https://github.com/kumabook/bebop.git

```

2. Edit manifest.json:

- Edit `commands._execute_browser_action.suggested_key`  with your favorite shortcut key.
- Edit `applications.gecko.id` with your id

3. Signup [developer hub](https://addons.mozilla.org/en-US/developers/addon/)
4. Get api key and api secret and set them to environment variables:

```
export NODE_ENV=production
export API_KEY=user:00000000:000
export API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. Build and upload package as your private addon:

```
npm run sign
```
