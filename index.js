var fsAccess = require('fs-access')
var path = require('path')
var which = require('which')

function isJSFlags (flag) {
  return flag.indexOf('--js-flags=') === 0
}

function sanitizeJSFlags (flag) {
  var test = /--js-flags=(['"])/.exec(flag)
  if (!test) {
    return flag
  }
  var escapeChar = test[1]
  var endExp = new RegExp(escapeChar + '$')
  var startExp = new RegExp('--js-flags=' + escapeChar)
  return flag.replace(startExp, '--js-flags=').replace(endExp, '')
}

var VivaldiBrowser = function (baseBrowserDecorator, args) {
  baseBrowserDecorator(this)

  var flags = args.flags || []
  var userDataDir = args.vivaldiDataDir || this._tempDir

  this._getOptions = function (url) {
    // Chrome CLI options
    // http://peter.sh/experiments/chromium-command-line-switches/
    flags.forEach(function (flag, i) {
      if (isJSFlags(flag)) {
        flags[i] = sanitizeJSFlags(flag)
      }
    })

    return [
      '--user-data-dir=' + userDataDir,
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--disable-translate',
      '--disable-background-timer-throttling'
    ].concat(flags, [url])
  }
}

// Return location of chrome.exe file for a given Chrome directory (available: "Chrome", "Chrome SxS").
// ****************** ONLY LINUX AT THIS TIME ********************
// function getChromeExe (chromeDirName) {
//   // Only run these checks on win32
//   if (process.platform !== 'win32') {
//     return null
//   }
//   var windowsChromeDirectory, i, prefix
//   var suffix = '\\Google\\' + chromeDirName + '\\Application\\chrome.exe'
//   var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']]
//
//   for (i = 0; i < prefixes.length; i++) {
//     prefix = prefixes[i]
//     try {
//       windowsChromeDirectory = path.join(prefix, suffix)
//       fsAccess.sync(windowsChromeDirectory)
//       return windowsChromeDirectory
//     } catch (e) {}
//   }
//
//   return windowsChromeDirectory
// }

function getBin (commands) {
  // Don't run these checks on win32
  if (process.platform !== 'linux') {
    return null
  }
  var bin, i
  for (i = 0; i < commands.length; i++) {
    try {
      if (which.sync(commands[i])) {
        bin = commands[i]
        break
      }
    } catch (e) {}
  }
  return bin
}

// ****************** ONLY LINUX AT THIS TIME ********************
// function getChromeDarwin (defaultPath) {
//   if (process.platform !== 'darwin') {
//     return null
//   }
//
//   try {
//     var homePath = path.join(process.env.HOME, defaultPath)
//     fsAccess.sync(homePath)
//     return homePath
//   } catch (e) {
//     return defaultPath
//   }
// }

VivaldiBrowser.prototype = {
  name: 'Vivaldi',

  DEFAULT_CMD: {
    // Try chromium-browser before chromium to avoid conflict with the legacy
    // chromium-bsu package previously known as 'chromium' in Debian and Ubuntu.
    // darwin: getChromeDarwin('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    // win32: getChromeExe('Chrome'),
    linux: getBin(['vivaldi'])
  },
  ENV_CMD: 'VIVALDI_BIN'
}

VivaldiBrowser.$inject = ['baseBrowserDecorator', 'args']



// PUBLISH DI MODULE
module.exports = {
  'launcher:Vivaldi': ['type', VivaldiBrowser]
}

module.exports.test = {
  isJSFlags: isJSFlags,
  sanitizeJSFlags: sanitizeJSFlags
}
