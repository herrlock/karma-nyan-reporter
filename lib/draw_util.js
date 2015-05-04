var colors = require('./colors');

function DrawUtil(shellWidth) {
  var width = shellWidth * 0.75 | 0;

  this.colors = colors.getColorPalette();
  this.numberOfLines = 4;
  this.nyanCatWidth = 11;
  this.scoreboardWidth = 5;
  this.tick = 0;
  this.trajectories = [[], [], [], []];
  this.trajectoryWidthMax = (width - this.nyanCatWidth);

  /**
   * Append the rainbow.
   *
   * @api private
   */

  this.appendRainbow = function(rainbowifier){
    var segment = this.tick ? '_' : '-';
    var rainbowified = rainbowifier.rainbowify(segment);

    for (var index = 0; index < this.numberOfLines; index++) {
      var trajectory = this.trajectories[index];
      if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();
      trajectory.push(rainbowified);
    }
  };

  /**
   * Draw the "scoreboard" showing the number
   * of passes, failures and pending tests.
   *
   * @api private
   */

  this.drawScoreboard = function(stats){
    var self = this;
    var colors = this.colors;

    function draw(color, n) {
      self.write(' ');
      self.write('\u001b[' + color + 'm' + n + '\u001b[0m');
      self.write('\n');
    }

    draw(colors.pass, stats.success);
    draw(colors.fail, stats.failed);
    draw(colors.skip, stats.skipped);
    this.write('\n');

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw the rainbow.
   *
   * @api private
   */

  this.drawRainbow = function(){
    var self = this;

    this.trajectories.forEach(function(line, index) {
      self.write('\u001b[' + self.scoreboardWidth + 'C');
      self.write(line.join(''));
      self.write('\n');
    });

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw the nyan cat
   *
   * @api private
   */

  this.drawNyanCat = function(stats) {
    var self = this;
    var startWidth = this.scoreboardWidth + this.trajectories[0].length;
    var color = '\u001b[' + startWidth + 'C';
    var padding = '';

    this.write(color);
    this.write('_,------,');
    this.write('\n');

    this.write(color);
    padding = self.tick ? '  ' : '   ';
    this.write('_|' + padding + '/\\_/\\ ');
    this.write('\n');

    this.write(color);
    padding = self.tick ? '_' : '__';
    var tail = self.tick ? '~' : '^';
    var face;
    this.write(tail + '|' + padding + this.face(stats) + ' ');
    this.write('\n');

    this.write(color);
    padding = self.tick ? ' ' : '  ';
    this.write(padding + '""  "" ');
    this.write('\n');

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw nyan cat face.
   *
   * @return {String}
   * @api private
   */

  this.face = function(stats) {
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

  this.cursorUp = function(n) {
    this.write('\u001b[' + n + 'A');
  };

  /**
   * Move cursor down `n`.
   *
   * @param {Number} n
   * @api private
   */

  this.cursorDown = function(n) {
    this.write('\u001b[' + n + 'B');
  };

  /**
   * Write to standard out
   *
   * @param {String} n
   * @api private
   */

  this.write = function(string) {
    process.stdout.write(string)
  };
}

exports.getInstance = function(shellWidth) { return new DrawUtil(shellWidth) };
