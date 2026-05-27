/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronDebug = require('electron-debug')
electronDebug({ showDevTools: false })

// Install `vue-devtools`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronDevtoolsInstaller = require('electron-devtools-installer')

require('electron').app.on('ready', () => {
  electronDevtoolsInstaller.default(electronDevtoolsInstaller.VUEJS_DEVTOOLS)
    .then(() => {})
    .catch((err: unknown) => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
})

// Require `main` process to boot app
import('./index')
