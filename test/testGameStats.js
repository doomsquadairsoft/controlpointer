var assert = require('chai').assert;
var GameStats = require('../src_shared/GameStats.js');
var fixtures = require('../fixtures');
var Promise = require('bluebird');
var R = require('ramda');


describe('GameStats', function() {
  var gs;

  beforeEach(function() {
    gs = new GameStats(fixtures.timeline);
  });
  describe('idk()', function() {
    it('should return a blah', function() {
      assert.isObject(gs);
    });
  });

  describe('getTimelineAfterDate()', function() {


    it('should accept a number', function() {
      const testDate = 1542570007606;
      const tl = gs.getTimelineAfterDate(testDate);
      assert.isArray(tl);
      const validate = (tli) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.isNumber(createdAt)
        assert.isAbove(createdAt, testDate);
      }
      R.forEach(validate, tl);
    });

    it('should accept a string', function() {
      const testDate = '1542570007606';
      const tl = gs.getTimelineAfterDate(testDate);
      assert.isArray(tl);
      const validate = (tli) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.isNumber(createdAt)
        assert.isAbove(createdAt, parseInt(testDate));
      }
      R.forEach(validate, tl);
    });

    it('should return an array containing only events after the inputted date', function() {
      const testDate = 1542570007606;
      const tl = gs.getTimelineAfterDate(testDate);
      assert.isArray(tl);
      const validate = (tli) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.isNumber(createdAt)
        assert.isAbove(createdAt, testDate);
      }
      R.forEach(validate, tl);
    });
  });

  xdescribe('buildTimePointer()', function() {
    xit('should return a promise', function() {
      var timeline = fixtures.timeline;
      console.log(timeline)
      var gs = new GameStats(timeline);
      var pointer = gs.buildTimePointer();

      assert.instanceOf(pointer, Promise);
    });
  });


});
