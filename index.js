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

// Return location of vivaldi.exe file for a given Vivaldi directory
 function getVivaldiExe (vivaldiDirName) {
   // Only run these checks on win32
   if (process.platform !== 'win32') {
     return null
   }
   var windowsVivaldiDirectory, i, prefix
   var suffix = '\\' + vivaldiDirName + '\\Application\\vivaldi.exe'
   var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']]

   for (i = 0; i < prefixes.length; i++) {
     prefix = prefixes[i]
     try {
       windowsVivaldiDirectory = path.join(prefix, suffix)
       fsAccess.sync(windowsVivaldiDirectory)
       return windowsVivaldiDirectory
     } catch (e) {}
   }

   return windowsVivaldiDirectory
 }

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

 function getVivaldiDarwin (defaultPath) {
   if (process.platform !== 'darwin') {
     return null
   }

   try {
     var homePath = path.join(process.env.HOME, defaultPath)
     fsAccess.sync(homePath)
     return homePath
   } catch (e) {
     return defaultPath
   }
 }

VivaldiBrowser.prototype = {
  name: 'Vivaldi',

  DEFAULT_CMD: {
    darwin: getVivaldiDarwin('/Applications/Vivaldi.app/Contents/MacOS/Vivaldi'),
    win32: getVivaldiExe('Vivaldi'),
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
