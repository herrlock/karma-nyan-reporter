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

    colorsFake = {
      'getColorPalette' : sinon.stub(),
    };

    colorsFake
      .getColorPalette
        .returns(fakeColors);

    shellWidth = 1000;

    module = rewire('../lib/draw_util');
    module.__set__('colors', colorsFake);

    sut = module.getInstance(shellWidth);

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

  /**
   * appendRainbow() tests
   */

  describe('appendRainbow method tests', function() {

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

      expect(sut.write.getCall(0).args[0]).to.eq(' ');
      expect(sut.write.getCall(1).args[0]).to.eq('\u001b[' + fakeColors.pass + 'm' + stats.success + '\u001b[0m');
      expect(sut.write.getCall(2).args[0]).to.eq('\n');

      expect(sut.write.getCall(3).args[0]).to.eq(' ');
      expect(sut.write.getCall(4).args[0]).to.eq('\u001b[' + fakeColors.fail + 'm' + stats.failed + '\u001b[0m');
      expect(sut.write.getCall(5).args[0]).to.eq('\n');

      expect(sut.write.getCall(6).args[0]).to.eq(' ');
      expect(sut.write.getCall(7).args[0]).to.eq('\u001b[' + fakeColors.skip + 'm' + stats.skipped + '\u001b[0m');
      expect(sut.write.getCall(8).args[0]).to.eq('\n');

      expect(sut.write.getCall(9).args[0]).to.eq('\n');
    });

    it('should call cursorUp with numberOfLines', function() {
      expect(sut.cursorUp.calledOnce).to.be.true;
      expect(sut.cursorUp.calledWithExactly(numOfLns)).to.be.true;
    });
  });

});
