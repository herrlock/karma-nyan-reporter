'use strict';

var dataStore = require('./data_store');
var drawUtil = require('./draw_util');
var printers = require('./printers');
var rainbowifier = require('./rainbowifier');
var shellUtil = require('./shell_util');

/**
 * NyanCat constructor
 */

function NyanCat(baseReporterDecorator, formatError, config) {
  var self = this;
  var defaultOptions = function() {
    return {
      suppressErrorReport: false
    };
  };

  self.options = defaultOptions();

  if ( config && config.nyanReporter ) {
    // merge defaults
    Object.keys( self.options ).forEach(function(optionName){
      if ( config.nyanReporter.hasOwnProperty(optionName) ) {
        self.options[optionName] = config.nyanReporter[optionName];
      }
    });
  }

  self.adapterMessages = [];

  self.adapters = [function(msg) {
    self.adapterMessages.push(msg);
  }];
}


NyanCat.prototype.reset = function() {
  this.allResults = {};
  this._browsers = [];
  this.browser_logs = {};
  this.browserErrors = [];
  this.colorIndex = 0;
  this.dataStore = dataStore.getInstance();
  this.drawUtil = drawUtil.getInstance(shellUtil.window.width);
  this.rainbowifier = rainbowifier.getInstance();
  this.stats = {};

  this.totalTime = 0;
  this.numberOfSlowTests = 0;
};

/**
 * Draw the nyan cat
 *
 * @api private
 */

NyanCat.prototype.draw = function(){
  this.drawUtil.appendRainbow(this.rainbowifier);
  this.drawUtil.drawScoreboard(this.stats);
  this.drawUtil.drawRainbow();
  this.drawUtil.drawNyanCat(this.stats);
  this.drawUtil.tick = !this.drawUtil.tick;
};



/*******************************************************/
/*************** Karma LifeCycle Mehtods ***************/
/*******************************************************/

/**
 * onRunStart - karma api method
 *
 * called at the beginning of each test run
 */

NyanCat.prototype.onRunStart = function (browsers) {
  shellUtil.cursor.hide();
  this.reset();
  this.numberOfBrowsers = (browsers || []).length;
  printers.write('\n');
};

/**
 * onBrowserLog - karma api method
 *
 * called each time a browser encounters a
 * console message (console.log, console.info, etc...)
 */

NyanCat.prototype.onBrowserLog = function(browser, log, type) {
  if (! this.browser_logs[browser.id]) {
    this.browser_logs[browser.id] = {
      name: browser.name,
      log_messages: []
    };
  }

  this.browser_logs[browser.id].log_messages.push(log);
};

/**
 * onSpecComplete - karma api method
 *
 * called when each test finishes
 */

NyanCat.prototype.onSpecComplete = function(browser, result) {
  this.stats = browser.lastResult;

  if (!this.options.suppressErrorReport) {
    this.dataStore.save(browser, result);
  }

  this.draw();
};

/**
 * onRunComplete - karma api method
 *
 * called either when a browser encounters
 * an error or when all tests have run
 */

NyanCat.prototype.onRunComplete = function(browsers, results) {
  if (this.browserErrors.length) {
    printers.printBrowserErrors(this.rainbowifier.rainbowify);
  } else {
    printers.printTestFailures(this.dataStore.getData(), this.stats, this.options.suppressErrorReport);
    printers.printBrowserLogs(this.browser_logs);
  }
  shellUtil.cursor.show();
};

/**
 * onBrowserStart - karma api method
 *
 * called when each browser is launched
 */

NyanCat.prototype.onBrowserStart = function (browser) {
  this._browsers.push(browser);
  this.numberOfBrowsers = this._browsers.length;
};

/**
 * onBrowserError - karma api method
 *
 * called when a browser encounters a compilation
 * error at runtime
 */

NyanCat.prototype.onBrowserError = function(browser, error) {
  this.browserErrors.push({"browser": browser, "error": error});
};




exports.NyanCat = NyanCat;
