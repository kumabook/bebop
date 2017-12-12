bebop
=====

[![Build Status](https://travis-ci.org/kumabook/bebop.svg?branch=master)](https://travis-ci.org/kumabook/bebop)
[![Greenkeeper badge](https://badges.greenkeeper.io/kumabook/bebop.svg)](https://greenkeeper.io/)
[![Coverage Status](https://coveralls.io/repos/github/kumabook/bebop/badge.svg?branch=master)](https://coveralls.io/github/kumabook/bebop?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/739ecb729336efef52b8/maintainability)](https://codeclimate.com/github/kumabook/bebop/maintainability)

bebop is a WebExtensions that makes your browsing groovy.

bebop is available on [Firefox Add-ons][] and [Chrome web store][]

Enjoy and swing your browsing!

About
-----


bebop is a WebExtensions that offers command line interface like
[emacs helm](https://github.com/emacs-helm/helm) for browsing.


Usage
-----

## command

1. `Click icon on toolbar` or `Ctrl+Comma` ... show popup that has command input
2. Input a query to narrow down the candidates.

    NOTE: On Windows, you need to press a tab-key to focus to a query input

    | type        | shorthand | description                     |
    |:------------|:---------:|:------------------------------- |
    | search      |           | open new tab with google search |
    | link        | l         | click a link in current page    |
    | tab         | t         | active selected tab             |
    | history     | h         | open a history                  |
    | bookmark    | b         | open a bookmark                 |

- `:type` narrows down to the candidates whose type is the specified type
- `x` also narrows down to the candidates whose shorthand is the specified type
- ex.
  - `阿部寛` narrows down to the all candidates searched with `阿部寛`
  - `:link` or `l` narrow down to link candidates
  - `:link 阿部寛` or `:l 阿部寛` narrow down to link candidates searched with `阿部寛`


3. Select the candidate. You can change the selected candidate with shortcut keys:

    | key-binding | action               |
    |:------------|:-------------------- |
    | tab         | next-candidate       |
    | S-tab       | previous-candidate   |
    | C-n         | next-candidate       |
    | C-p         | previous-candidate   |
    | C-j         | next-candidate       |
    | C-k         | previous-candidate   |

4. Execute command. A candidate can be executed by multiple commands.
You can execute default command by pressing `return` or click a candidate.
You can also execute another command by these shortcuts.

    | key-binding | command                 |
    |:------------|:----------------------- |
    | return      | execute default command |
    | S-return    | execute second command  |
    | C-return    | show command list       |


You can change shortcut key from `Ctrl+Comma`.
See [Customize](#change-shortcut-key-with-your-own-private-addon)

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

[Firefox Add-ons]:  https://addons.mozilla.org/ja/firefox/addon/bebop/
[Chrome web store]: https://chrome.google.com/webstore/detail/bebop/idiejicnogeolaeacihfjleoakggbdid
