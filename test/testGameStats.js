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


  describe('timelineAfterDate()', function() {


    it('should accept a number', function() {
      const testDate = 1542570007606;
      const tl = gs.timelineAfterDate(testDate);
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
      const tl = gs.timelineAfterDate(testDate);
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
      const tl = gs.timelineAfterDate(testDate);
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
    xit('should return a point in time (ms since epoch)', function() {
      var timeline = fixtures.timeline;
      //console.log(timeline)
      var gs = new GameStats(timeline);
      var pointer = gs.buildTimePointer();

      assert.instanceOf(pointer, Promise);
    });
  });

  describe('mostRecentStop()', function() {
    it('should return the ms since epoch of the most recent stop', function() {
      const mostRecent = gs.mostRecentStop();
      assert.isNumber(mostRecent);
      assert.equal(mostRecent, 1542652594189);
    });
  });


  describe('gameStartTime()', function() {
    it('should return a number', function() {
      const gameStartTime = gs.gameStartTime();
      //console.log(gameStartTime)
      assert.isNumber(gameStartTime);
    });

    it('should return the timestamp of the first start action in the active timeline', function() {
      const tl = gs.activeTimeline();
      const firstStartEvent = R.find(R.propEq('action', 'start'), tl);
      const gameStartTime = gs.gameStartTime();
      assert.isDefined(gameStartTime);
      assert.equal(
        gameStartTime,
        R.prop('createdAt', firstStartEvent)
      );
    });
  });

  describe('gamePausedDuration()', function() {
    it('should return the total number of ms that the game has been paused for', function() {
      const tl = gs.activeTimeline();
      const sorter = R.sortBy(R.prop('createdAt'))
      const orderedTl = sorter(tl);
      const pausedDuration = gs.gamePausedDuration();
      assert.equal(pausedDuration, 104619290);
    });
    it('should work with simple timelines', function() {
      const exampleTimeline = [
        {
          'action': 'start',
          'createdAt': 5000
        },
        {
          'action': 'pause',
          'createdAt': 7000
        },
        {
          'action': 'start',
          'createdAt': 12000
        },
        {
          'action': 'pause',
          'createdAt': 20000
        },
      ];

      const gs2 = new GameStats(exampleTimeline);

      const gpd = gs2.gamePausedDuration();
      assert.equal(gpd, 10000);

    })
  });

  describe('gameDuration()', function() {
    it('should return the total number of ms that the game has been running for', function() {
      const gameDuration = gs.gameDuration();
      assert.isNumber(gameDuration);
    });
  });

  describe('gameEndTime()', function() {
    it('should return the computed end time based on start time, accrued paused time, and specified game duration', function() {
      const gameEndTime = gs.gameEndTime();
      assert.isNumber(gameEndTime);
    });
  });

  describe('activeTimeline()', function() {
    it('should return an array of timeline events', function() {
      const tl = gs.activeTimeline();

      assert.isArray(tl);
      const validate = (tli) => {
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');
      };
      R.forEach(validate, tl);
    })

    it('should contain 24 elements', function() {
        const tl = gs.activeTimeline();
        assert.lengthOf(tl, 24);
    })

    it('should never contain a stop action', function() {
      const tl = gs.activeTimeline();
      const validate = (tli) => {
        assert.notPropertyVal(tli, 'action', 'stop');
      }
      R.forEach(validate, tl);
    });
  });

  describe('cleansedTimeline()', function() {
    it('should return an array of timeline events without duplicate neighboring actions', function() {
      const tl = gs.cleansedTimeline();

      // R.forEach((i) => {
      //   console.log(R.prop('action', i));
      // }, tl);

      assert.isArray(tl);
      const validate = (tli, idx, allTl) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');


        R.unless(
          R.equals(allTl.length, idx),
          assert.notEqual(
            R.prop('action', tli),
            R.prop('action', allTl[idx+1]),
            'A duplicate timeline action was found in cleansedTimeline\'s output!'
          )
        )
      };

      const forEachIdx = R.addIndex(R.forEach);
      forEachIdx(validate, tl);
    });

    it('should have 30 elements', function() {
      const tl = gs.cleansedTimeline();
      assert.lengthOf(tl, 30);
    });

    it('should have chronologically sorted events', function() {
      const tl = gs.cleansedTimeline();
      var lastTimestamp = 0;
      const validate = (tli) => {
        const thisTimestamp = R.prop('createdAt', tli)
        assert.isAbove(thisTimestamp, lastTimestamp);
        lastTimestamp = R.prop('createdAt', tli);
      }
      R.forEach(validate, tl);
    });
  });


});
