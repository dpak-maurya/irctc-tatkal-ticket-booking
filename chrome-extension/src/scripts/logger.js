/* global module */

const Logger = {
  isEnabled: false,

  enable: function() {
    this.isEnabled = true;
  },

  disable: function() {
    this.isEnabled = false;
  },

  _getCallerInfo: function() {
    const error = new Error();
    const stack = error.stack.split('\n')[3]; // Get caller's stack info
    const match = stack.match(/at\s+(?:\w+\s+)?\(?(.+):(\d+):(\d+)\)?/);
    if (match) {
      const [, file, line] = match;
      const fileName = file.split('/').pop(); // Get just the filename
      return `[${fileName}:${line}]`;
    }
    return '';
  },

  log: function(...args) {
    if (this.isEnabled) {
      const callerInfo = this._getCallerInfo();
      console.log(`[IRCTC-Bot]${callerInfo}:`, ...args);
    }
  },

  error: function(...args) {
    if (this.isEnabled) {
      const callerInfo = this._getCallerInfo();
      console.error(`[IRCTC-Bot]${callerInfo}:`, ...args);
    }
  },

  warn: function(...args) {
    if (this.isEnabled) {
      const callerInfo = this._getCallerInfo();
      console.warn(`[IRCTC-Bot]${callerInfo}:`, ...args);
    }
  },

  info: function(...args) {
    if (this.isEnabled) {
      const callerInfo = this._getCallerInfo();
      console.info(`[IRCTC-Bot]${callerInfo}:`, ...args);
    }
  }
};

// Enable/disable logging based on storage setting
chrome.storage.local.get('debugMode', function(result) {
  if (result.debugMode) {
    Logger.enable();
  } else {
    Logger.disable();
  }
}); 

export default Logger;

