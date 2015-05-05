'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var expect = chai.expect;

describe('draw_util.js test suite', function() {
  var sut;
  var module;
  var shellWidth;
  var fakeColors;
  var colorsFake;

  beforeEach(function(done) {
    fakeColors = {
      'pass' : 'pass',
      'fail' : 'fail',
      'skip' : 'skip'
    };

    shellWidth = 100;

    module = rewire('../lib/draw_util');

    sut = module.getInstance(shellWidth);
    sut.write = sinon.spy();

    done();
  });

  afterEach(function(done) {
    sut = null;
    module = null;
    shellWidth = null;
    fakeColors = null;
    colorsFake = null;
    done();
  });

  describe('instantiation tests', function() {
    it('should set the defaults values appropriately', function() {
      var maxWidth = sut.trajectoryWidthMax;
      expect(sut.numberOfLines).to.eq(4);
      expect(sut.nyanCatWidth).to.eq(11);
      expect(sut.scoreboardWidth).to.eq(5);
      expect(sut.tick).to.eq(0);
      expect(sut.trajectories).to.eql([[], [], [], []]);
      expect(maxWidth).to.eq((shellWidth * 0.75 | 0) - sut.nyanCatWidth);
    });
  });

  /**
   * appendRainbow() tests
   */

  describe('appendRainbow method tests', function() {
    var rainbowifierFake;

    beforeEach(function(done) {
      rainbowifierFake = {
        'rainbowify' : sinon.stub()
      };

      rainbowifierFake.rainbowify.withArgs('-').returns('-');
      rainbowifierFake.rainbowify.withArgs('_').returns('_');
      done();
    });

    afterEach(function(done) {
      rainbowifierFake = null;
      done();
    });

    it('should manipulate the trajectories data appropriately', function() {
      sut.appendRainbow(rainbowifierFake);

      expect(rainbowifierFake.rainbowify.calledOnce).to.be.true;
      expect(rainbowifierFake.rainbowify.calledWithExactly('-')).to.be.true;
      expect(sut.trajectories.length).to.eq(4);
      expect(sut.trajectories[0].length).to.eq(1);
      expect(sut.trajectories[1].length).to.eq(1);
      expect(sut.trajectories[2].length).to.eq(1);
      expect(sut.trajectories[3].length).to.eq(1);
      expect(sut.trajectories[0][0]).to.eq('-');
      expect(sut.trajectories[1][0]).to.eq('-');
      expect(sut.trajectories[2][0]).to.eq('-');
      expect(sut.trajectories[3][0]).to.eq('-');

      sut.tick = true;
      sut.appendRainbow(rainbowifierFake);

      expect(rainbowifierFake.rainbowify.calledWithExactly('-')).to.be.true;
      expect(sut.trajectories.length).to.eq(4);
      expect(sut.trajectories[0].length).to.eq(2);
      expect(sut.trajectories[1].length).to.eq(2);
      expect(sut.trajectories[2].length).to.eq(2);
      expect(sut.trajectories[3].length).to.eq(2);
      expect(sut.trajectories[0][1]).to.eq('_');
      expect(sut.trajectories[1][1]).to.eq('_');
      expect(sut.trajectories[2][1]).to.eq('_');
      expect(sut.trajectories[3][1]).to.eq('_');
    });

    it('should not allow trajectories sub-arrays length to exceed trajectoryWidthMax', function() {
      sut.trajectoryWidthMax = 1;

      for(var i = 0; i < 10; i++) {
        sut.appendRainbow(rainbowifierFake);
      }

      expect(sut.trajectories[0].length).to.eq(1);
      expect(sut.trajectories[1].length).to.eq(1);
      expect(sut.trajectories[2].length).to.eq(1);
      expect(sut.trajectories[3].length).to.eq(1);

      sut.trajectoryWidthMax = 2;

      for(var i = 0; i < 10; i++) {
        sut.appendRainbow(rainbowifierFake);
      }

      expect(sut.trajectories[0].length).to.eq(2);
      expect(sut.trajectories[1].length).to.eq(2);
      expect(sut.trajectories[2].length).to.eq(2);
      expect(sut.trajectories[3].length).to.eq(2);
    });
  });

  /**
   * drawScoreboard() tests
   */

  describe('drawScoreboard method tests', function() {
    var colors;
    var stats;
    var numOfLns;

    beforeEach(function(done) {
      stats = {
        'success': 33,
        'failed': 66,
        'skipped': 99
      };

      numOfLns = 111;

      sut.write = sinon.spy();
      sut.cursorUp = sinon.spy();
      sut.numberOfLines = numOfLns;

      sut.drawScoreboard(stats);
      done();
    });

    afterEach(function(done) {
      colors = null;
      stats = null;
      numOfLns = null;
      done();
    });

    it('should call the write method with the correct values', function() {
      expect(sut.write.callCount).to.eq(10);

      var pass = '\u001b[' + sut.colors.pass + 'm' + stats.success + '\u001b[0m';
      var fail = '\u001b[' + sut.colors.fail + 'm' + stats.failed + '\u001b[0m';
      var skip = '\u001b[' + sut.colors.skip + 'm' + stats.skipped + '\u001b[0m';

      expect(sut.write.getCall(0).args[0]).to.eq(' ');
      expect(sut.write.getCall(1).args[0]).to.eq(pass);
      expect(sut.write.getCall(2).args[0]).to.eq('\n');

      expect(sut.write.getCall(3).args[0]).to.eq(' ');
      expect(sut.write.getCall(4).args[0]).to.eq(fail);
      expect(sut.write.getCall(5).args[0]).to.eq('\n');

      expect(sut.write.getCall(6).args[0]).to.eq(' ');
      expect(sut.write.getCall(7).args[0]).to.eq(skip);
      expect(sut.write.getCall(8).args[0]).to.eq('\n');

      expect(sut.write.getCall(9).args[0]).to.eq('\n');
    });

    it('should call cursorUp with numberOfLines', function() {
      expect(sut.cursorUp.calledOnce).to.be.true;
      expect(sut.cursorUp.calledWithExactly(numOfLns)).to.be.true;
    });
  });

  /**
   * drawRainbow() tests
   */

  describe('drawRainbow method tests', function() {
    it('should call write and cursorUp as expected', function() {
      sut.trajectories = [['hel'], ['lo!']];
      sut.cursorUp = sinon.spy();
      sut.drawRainbow();

      expect(sut.write.callCount).to.eq(6);
      expect(sut.cursorUp.calledOnce).to.be.true;

      var resultOne = '\u001b[' + sut.scoreboardWidth + 'C';
      var resultTwo = sut.trajectories[0].join('');
      var resultThree = '\n';

      expect(sut.write.firstCall.calledWithExactly(resultOne)).to.be.true;
      expect(sut.write.secondCall.calledWithExactly(resultTwo)).to.be.true;
      expect(sut.write.thirdCall.calledWithExactly(resultThree)).to.be.true;
    });
  });

  /**
   * drawNyanCat() tests
   */

  describe('drawNyanCat method tests', function() {
    it('should call the write and cursorUp as expected', function() {
      var write = sut.write;
      var face = 'face';
      var stats = 'stats';
      var color = '\u001b[' + (sut.scoreboardWidth + sut.trajectories[0].length) + 'C';

      sut.face = sinon.stub();
      sut.face.withArgs(stats).returns(face);
      sut.cursorUp = sinon.spy();
      sut.drawNyanCat(stats);

      expect(write.callCount).to.eq(12);
      expect(sut.cursorUp.calledOnce).to.be.true;

      expect(write.getCall(0).args[0]).to.eq(color);
      expect(write.getCall(1).args[0]).to.eq('_,------,');
      expect(write.getCall(2).args[0]).to.eq('\n');

      expect(write.getCall(3).args[0]).to.eq(color);
      expect(write.getCall(4).args[0]).to.eq('_|   /\\_/\\ ');
      expect(write.getCall(5).args[0]).to.eq('\n');

      expect(write.getCall(6).args[0]).to.eq(color);
      expect(write.getCall(7).args[0]).to.eq('^|__' + face + ' ');
      expect(write.getCall(8).args[0]).to.eq('\n');

      expect(write.getCall(9).args[0]).to.eq(color);
      expect(write.getCall(10).args[0]).to.eq('  ""  "" ');
      expect(write.getCall(11).args[0]).to.eq('\n');
    });
  });

  /**
   * face() tests
   */

  describe('face method tests', function() {
    it('should return as exected if stats.failed is true', function() {
      var face = sut.face({failed: true});
      expect(face).to.eq('( x .x)');
    });

    it('should return as exected if stats.skipped is true', function() {
      var face = sut.face({skipped: true});
      expect(face).to.eq('( o .o)');
    });

    it('should return as exected if stats.success is true', function() {
      var face = sut.face({success: true});
      expect(face).to.eq('( ^ .^)');
    });

    it('should return as exected if none of the above are true', function() {
      var face = sut.face({});
      expect(face).to.eq('( - .-)');
    });
  });

  /**
   * cursorUp() tests
   */

  describe('cursorUp method tests', function() {
    it('should call write with the expected values', function() {
      var arg = 'blah';
      sut.cursorUp(arg);

      expect(sut.write.calledOnce).to.be.true;
      expect(sut.write.calledWithExactly('\u001b[' + arg + 'A')).to.be.true;
    });
  });

  /**
   * cursorUp() tests
   */

  describe('cursorDown method tests', function() {
    it('should call write with the expected values', function() {
      var arg = 'arg';
      sut.cursorDown(arg);

      expect(sut.write.calledOnce).to.be.true;
      expect(sut.write.calledWithExactly('\u001b[' + arg + 'B')).to.be.true;
    });
  });

  /**
   * write() tests
   */

  describe('write method tests', function() {
    it('should call process.stdout.write with the expected args', function() {
      sut = module.getInstance(shellWidth);
      var write = process.stdout.write;
      process.stdout.write = sinon.spy();

      sut.write('arg');

      expect(process.stdout.write.calledWithExactly('arg')).to.be.true;
      process.stdout['write'] = write;
    });
  });
});
