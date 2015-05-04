'use strict';

var colors = require('./colors');
var rainbowifier = require('./rainbowifier');
var dataStore = require('./data_store');
var printers = require('./printers');
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
  var width = shellUtil.window.width * 0.75 | 0;

  this.stats = {};
  this.rainbowifier = rainbowifier.getInstance();
  this.colorIndex = 0;
  this.numberOfLines = 4;
  this.trajectories = [[], [], [], []];
  this.nyanCatWidth = 11;
  this.trajectoryWidthMax = (width - this.nyanCatWidth);
  this.scoreboardWidth = 5;
  this.tick = 0;
  this.colors = colors.getColorPalette();
  this._browsers = [];
  this.browser_logs = {};
  this.browserErrors = [];
  this.allResults = {};
  this.dataStore = dataStore.getInstance();
  this.totalTime = 0;
  this.numberOfSlowTests = 0;
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





/*******************************************************/
/*************** Drawing Output Mehtods ****************/
/*******************************************************/

/**
 * Draw the nyan cat
 *
 * @api private
 */

NyanCat.prototype.draw = function(){
  this.appendRainbow();
  this.drawScoreboard();
  this.drawRainbow();
  this.drawNyanCat();
  this.tick = !this.tick;
};

/**
 * Draw the "scoreboard" showing the number
 * of passes, failures and pending tests.
 *
 * @api private
 */

NyanCat.prototype.drawScoreboard = function(){
  var stats = this.stats;
  var colors = this.colors;

  function draw(color, n) {
    printers.write(' ');
    printers.write('\u001b[' + color + 'm' + n + '\u001b[0m');
    printers.write('\n');
  }

  draw(colors.pass, stats.success);
  draw(colors.fail, stats.failed);
  draw(colors.skip, stats.skipped);
  printers.write('\n');

  this.cursorUp(this.numberOfLines);
};

/**
 * Append the rainbow.
 *
 * @api private
 */

NyanCat.prototype.appendRainbow = function(){
  var segment = this.tick ? '_' : '-';
  var rainbowified = this.rainbowifier.rainbowify(segment);

  for (var index = 0; index < this.numberOfLines; index++) {
    var trajectory = this.trajectories[index];
    if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();
    trajectory.push(rainbowified);
  }
};

/**
 * Draw the rainbow.
 *
 * @api private
 */

NyanCat.prototype.drawRainbow = function(){
  var self = this;

  this.trajectories.forEach(function(line, index) {
    printers.write('\u001b[' + self.scoreboardWidth + 'C');
    printers.write(line.join(''));
    printers.write('\n');
  });

  this.cursorUp(this.numberOfLines);
};

/**
 * Draw the nyan cat
 *
 * @api private
 */

NyanCat.prototype.drawNyanCat = function() {
  var self = this;
  var startWidth = this.scoreboardWidth + this.trajectories[0].length;
  var color = '\u001b[' + startWidth + 'C';
  var padding = '';

  printers.write(color);
  printers.write('_,------,');
  printers.write('\n');

  printers.write(color);
  padding = self.tick ? '  ' : '   ';
  printers.write('_|' + padding + '/\\_/\\ ');
  printers.write('\n');

  printers.write(color);
  padding = self.tick ? '_' : '__';
  var tail = self.tick ? '~' : '^';
  var face;
  printers.write(tail + '|' + padding + this.face() + ' ');
  printers.write('\n');

  printers.write(color);
  padding = self.tick ? ' ' : '  ';
  printers.write(padding + '""  "" ');
  printers.write('\n');

  this.cursorUp(this.numberOfLines);
};

/**
 * Draw nyan cat face.
 *
 * @return {String}
 * @api private
 */

NyanCat.prototype.face = function() {
  var stats = this.stats;
  if (stats.failed) {
    return '( x .x)';
  } else if (stats.skipped) {
    return '( o .o)';
  } else if(stats.success) {
    return '( ^ .^)';
  } else {
    return '( - .-)';
  }
};

/**
 * Move cursor up `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorUp = function(n) {
  printers.write('\u001b[' + n + 'A');
};

/**
 * Move cursor down `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorDown = function(n) {
  printers.write('\u001b[' + n + 'B');
};

exports.NyanCat = NyanCat;
