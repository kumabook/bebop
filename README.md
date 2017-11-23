bebop
=====

About
-----

bebop is a webextension that offers
emacs key-bindings and command line interface like
[emacs helm](https://github.com/emacs-helm/helm) for browsing.


Usage
-----

## command

1. Click icon on toolbar or Ctrl+J ... snow popup that has command input
2. Input a query to narrow down the commands.

| type        | description                     |
|:------------|:------------------------------- |
| search      | open new tab with google search |
| history     | open a history                  |


## emacs key-bindings on textarea

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
