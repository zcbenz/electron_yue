# Electron with Native UI demo

This demo shows how an app would look like with mixed uses of WebContents and
Native UI.

__This demo can only run on macOS with Electron 8.__

## Steps

1. Clone this repo.
2. `npm install -g electron@8`
3. `electron main.js`

## About the `gui.node`

The native UI bindings are provided by the https://github.com/yue/yue project,
documentations can be found at https://libyue.com/docs/latest/js/.

The `gui.node` is a custom native module compiled targeting Electron 8.3.0.
(The official prebuilt binaries are only targeting Node.js.)
