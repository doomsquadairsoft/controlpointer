const assert = require('chai').assert;
const gameStats = require('../src_shared/gameStats.js');
const fixtures = require('../fixtures');
const Promise = require('bluebird');
const R = require('ramda');
const Vue = require('vue');


describe('gameStats', function() {

  var app;
  beforeEach(function() {
    app = new Vue();
    Vue.use(gameStats);
    // gs = new GameStats(fixtures.timeline, fixtures.gameSettings);
    // gsSimple = new GameStats(fixtures.simpleTimeline, fixtures.simpleGameSettings);
  });


  describe('activeTimelineVs()', function() {
    it('should return an array suited for d3-vs d3Timeline', function() {
      const atvs = app.$gameStats.activeTimelineVs(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      // {
      //   from: new Date('2018-12-26 01:18:01'),
      //   to: new Date('2018-12-26 01:20:00'),
      //   title: 'RED controlled the BRIDGE',
      //   group: 'BRIDGE',
      //   className: 'redBar',
      // }
      assert.isArray(atvs);
      const validate = (tli) => {
        assert.property(tli, 'group');
        assert.property(tli, 'className');
        assert.property(tli, 'title');
        assert.isString(tli.group);
        assert.isString(tli.className);
        assert.isString(tli.title);
        assert.match(tli.className, /redBar|bluBar|gryBar|grnBar|ylwBar/);
      }
      R.forEach(validate, atvs);
    });
  });


  describe('gameLength()', function() {
    it('should return a ms duration 7200000', function() {
      const gl = app.$gameStats.gameLength(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.equal(gl, 7200000);
    });
    it('should return a ms duration 300000 (simpleGameSettings)', function() {
      const gl = app.$gameStats.gameLength(fixtures.timeline, fixtures.simpleGameSettings, fixtures.timePointer);
      assert.equal(gl, 300000);
    });
    it('should return a big number (centuryGameSettings)', function() {
      const gl = app.$gameStats.gameLength(fixtures.runningTimeline, fixtures.centuryGameSettings);
      assert.equal(gl, 9467280000000);
    });
    it('should not throw an error when a gameLength is not defined', function() {
      assert.doesNotThrow(() => {
        app.$gameStats.gameLength(fixtures.timeline, fixtures.invalidGameSettings);
      });
    });
    it('should return a sensible default when a gameLength is not defined', function() {
      const gl = app.$gameStats.gameLength(fixtures.timeline, fixtures.invalidGameSettings);
      assert.equal(gl, 50000);
    });
  });

  describe('timePointer()', function() {
    it('should return a ms timestamp', function() {
      const timePointer = app.$gameStats.timePointer(
        fixtures.timeline,
        fixtures.simpleGameSettings,
        fixtures.timePointer
      );
      assert.isNumber(timePointer);
    });
  });

  // xdescribe('timelineAfterDate()', function() {
  //   it('should accept a number', function() {
  //     const testDate = 1542570007606;
  //     const tl = gs.timelineAfterDate(testDate);
  //     assert.isArray(tl);
  //     const validate = (tli) => {
  //       const createdAt = parseInt(R.prop('createdAt', tli));
  //       assert.isNumber(createdAt)
  //       assert.isAbove(createdAt, testDate);
  //     }
  //     R.forEach(validate, tl);
  //   });
  //
  //   it('should accept a string', function() {
  //     const testDate = '1542570007606';
  //     const tl = gs.timelineAfterDate(testDate);
  //     assert.isArray(tl);
  //     const validate = (tli) => {
  //       const createdAt = parseInt(R.prop('createdAt', tli));
  //       assert.isNumber(createdAt)
  //       assert.isAbove(createdAt, parseInt(testDate));
  //     }
  //     R.forEach(validate, tl);
  //   });
  //
  //   it('should return an array containing only events after the inputted date', function() {
  //     const testDate = 1542570007606;
  //     const tl = gs.timelineAfterDate(testDate);
  //     assert.isArray(tl);
  //     const validate = (tli) => {
  //       const createdAt = parseInt(R.prop('createdAt', tli));
  //       assert.isNumber(createdAt)
  //       assert.isAbove(createdAt, testDate);
  //     }
  //     R.forEach(validate, tl);
  //   });
  // });

  describe('gameStatus()', function() {
    it('should return an object with status data', function() {
      const status = app.$gameStats.gameStatus(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isObject(status);
      assert.property(status, 'msg');
      assert.property(status, 'code');
      assert.isString(status.msg);
      assert.isNumber(status.code);
    });

    it('should return a message with either \'running\', \'paused\', \'over\', or \'stopped\'.', function() {
      const status = app.$gameStats.gameStatus(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.match(status.msg, /running|paused|stopped|over/);
    });

    it('should return an integer status code with either 0, 1, 2, or 3.', function() {
      const status = app.$gameStats.gameStatus(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.oneOf(status.code, [0, 1, 2, 3]);
    });

    it('should indicate that the game is running when the most recent lifecycle event is a start action', function() {
      const timePointer = 4701341506760;
      const status = app.$gameStats.gameStatus(fixtures.runningTimeline, fixtures.centuryGameSettings, timePointer);
      assert.deepEqual(status, {
        code: 0,
        msg: 'running'
      });
    });

    it('should indicate that the game is stopped when the active timeline is empty', function() {
      const status = app.$gameStats.gameStatus(fixtures.stoppedTimeline, fixtures.gameSettings, fixtures.timePointer);
      assert.deepEqual(status, {
        code: 2,
        msg: 'stopped'
      });
    });

    it('should indicate that the game is paused when the most recent lifecycle event is a pause action', function() {
      const timePointer = 5701341506760;
      const status = app.$gameStats.gameStatus(fixtures.pausedTimeline, fixtures.centuryGameSettings, timePointer);
      assert.deepEqual(status, {
        code: 1,
        msg: 'paused'
      });
    });

    it('should indicate that the game is over when the endTime is in the past', function() {
      const timePointer = 7857016999962;
      const status = app.$gameStats.gameStatus(
        fixtures.timeline,
        fixtures.gameSettings,
        timePointer
      );
      assert.deepEqual(status, {
        code: 3,
        msg: 'over'
      });
    });
  });

  describe('mostRecentStop()', function() {
    it('should return the ms since epoch of the most recent stop', function() {
      const mostRecent = app.$gameStats.mostRecentStop(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isNumber(mostRecent);
      assert.equal(mostRecent, 1542652594189);
    });
  });

  describe('remainingGameTimeDigital()', function() {
    it('should return a digital clock-style string of the remaining time in the game', function() {
      const rgtd = app.$gameStats.remainingGameTimeDigital(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isString(rgtd);
      assert.match(rgtd, /\d\d:\d\d:\d\d/);
    });

    it('should return 00:04:50 (simpleTimeline)', function() {
      const rgtd = app.$gameStats.remainingGameTimeDigital(fixtures.simpleTimeline, fixtures.simpleGameSettings, 20000);
      assert.isString(rgtd);
      assert.equal(rgtd, '00:04:50');
    });
  });

  describe('remainingGameTime()', function() {
    it('should return a ms duration of the remaining time in the game', function() {
      const rgt = app.$gameStats.remainingGameTime(fixtures.simpleTimeline, fixtures.simpleGameSettings, 20000);
      assert.isNumber(rgt);
      assert.equal(rgt, 290000);
    });
  });

  describe('remainingGameTimeHumanized()', function() {
    it('should return a human readable string of the remaining time in the game. Example: \'Five minutes and thirty seconds\'', function() {
      const rgt = app.$gameStats.remainingGameTimeHumanized(fixtures.simpleTimeline, fixtures.simpleGameSettings, 20000);
      assert.isString(rgt);
      assert.equal(rgt, '5 minutes');
    });
  });


  describe('gameStartTime()', function() {
    it('should return a number', function() {
      const gameStartTime = app.$gameStats.gameStartTime(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isNumber(gameStartTime);
    });

    it('should not require a third parameter (timePointer)', function() {
      const gameStartTime = app.$gameStats.gameStartTime(fixtures.timeline, fixtures.gameSettings);
      assert.isNumber(gameStartTime);
    });

    it('should return the timestamp of the first start action in the active timeline', function() {
      const tl = app.$gameStats.activeTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      const firstStartEvent = R.find(R.propEq('action', 'start'), tl);
      const gameStartTime = app.$gameStats.gameStartTime(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isDefined(gameStartTime);
      assert.equal(
        gameStartTime,
        R.prop('createdAt', firstStartEvent)
      );
    });

    it('should return 5000 (simpleTimeline)', function() {
      const gst = app.$gameStats.gameStartTime(fixtures.simpleTimeline, fixtures.simpleGameSettings, fixtures.timePointer);
      assert.equal(gst, 5000);
    });
  });

  describe('gamePausedDuration()', function() {
    it('should return the total number of ms that the game has been paused for', function() {
      const tl = app.$gameStats.activeTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      const lastEventTimestamp = R.prop('createdAt', R.last(tl));
      const timePointer = lastEventTimestamp;
      const pausedDuration = app.$gameStats.gamePausedDuration(fixtures.timeline, fixtures.gameSettings, timePointer);
      assert.equal(
        pausedDuration,
        623534264
      );
    });

    it('should correctly calculate total paused time between game start and timePointer', function() {
      const timePointer = 40000;
      const gpd = app.$gameStats.gamePausedDuration(fixtures.simpleTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gpd, 25000)
    });

    it('should return 100000 (runningTimeline)', function() {
      const timePointer = 4701341506760;
      const gpd = app.$gameStats.gamePausedDuration(fixtures.runningTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gpd, 100000);
    });

    it('should return the same pausedDuration even when the timePointer is set past the end time (runningTimeline)', function() {
      const timePointer = 5701341506760;
      const gpd = app.$gameStats.gamePausedDuration(fixtures.runningTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gpd, 100000);
    });

    it('should return 5000', function() {
      const timePointer = 20000;
      const gpd = app.$gameStats.gamePausedDuration(fixtures.simpleTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gpd, 5000);
    });


  });

  describe('gameElapsedDuration()', function() {
    it('should return the total number of ms that the game has been running AND paused for', function() {
      const gameElapsedDuration = app.$gameStats.gameElapsedDuration(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isNumber(gameElapsedDuration);
    });

    it('should return a different value based on where timePointer is at', function() {
      const timePointer = 1544244638041;
      const gameElapsedDuration = app.$gameStats.gameElapsedDuration(fixtures.timeline, fixtures.gameSettings, timePointer);
      assert.equal(gameElapsedDuration, 374793);
    });
  });

  describe('gameRunningDuration()', function() {
    it('should return the total number of ms that the game has been RUNNING for (not paused)', function() {
      const timePointer = 20000;
      const gameRunningDuration = app.$gameStats.gameRunningDuration(fixtures.simpleTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gameRunningDuration, 10000);
    });
  });

  describe('gameEndTimeHumanized', function() {
    it('should return the game end time in a human readable string', function() {
      const geth = app.$gameStats.gameEndTimeHumanized(fixtures.simpleTimeline, fixtures.simpleGameSettings, fixtures.timePointer);
      assert.isString(geth);
      assert.match(geth, /^Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/); // 'Tuesday, December 25th 2018, 11:39:10 am')
    });
  });

  describe('gameEndTime()', function() {
    it('should return the computed end time based on start time, accrued paused time, and specified game duration', function() {
      const gameEndTime = app.$gameStats.gameEndTime(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isNumber(gameEndTime);
    });

    it('should return 4701341406760 (runningTimeline)', function() {
      const timePointer = 4701341506760;
      const gameEndTime = app.$gameStats.gameEndTime(fixtures.runningTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gameEndTime, 4701341706760);
    });

    it('should return 310000 (simpleTimeline)', function() {
      const timePointer = 20000;
      const gameEndTime = app.$gameStats.gameEndTime(fixtures.simpleTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gameEndTime, 310000);
    });

    it('should return 1545663855512 when the game ended in the past (finishedTimeline)', function() {
      const timePointer = 1545859463062;
      const gameEndTime = app.$gameStats.gameEndTime(fixtures.finishedTimeline, fixtures.simpleGameSettings, timePointer);
      assert.equal(gameEndTime, 1545663855512);
    });

  });

  describe('lifecycleTimeline()', function() {
    it('should return an array of start/pause timeline events', function() {
      const lctl = app.$gameStats.lifecycleTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.isArray(lctl);
      const validate = (tli) => {
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.match(tli.action, /start|pause/);
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');
      }
      R.forEach(validate, lctl);
    });
    it('should be an array of 3 events (runningTimeline)', function() {
      const timePointer = 4701341506760;
      const lctl = app.$gameStats.lifecycleTimeline(fixtures.runningTimeline, fixtures.gameSettings, timePointer);
      assert.lengthOf(lctl, 3);
    });
    it('should be an array of 4 events (pausedTimeline)', function() {
      const timePointer = 5701341506760;
      const lctl = app.$gameStats.lifecycleTimeline(fixtures.pausedTimeline, fixtures.gameSettings, timePointer);
      assert.lengthOf(lctl, 4);
    });
  });

  describe('activeTimeline()', function() {
    it('should throw an error if not receiving any parameters', function() {
      assert.throws(() => {
        app.$gameStats.activeTimeline();
      });
    });

    it('should throw an error if only receiving 1 parameter', function() {
      assert.throws(() => {
        app.$gameStats.activeTimeline(fixtures.timeline);
      });
    });

    it('should throw an error if parameters are strings', function() {
      assert.throws(() => {
        app.$gameStats.activeTimeline('timeline', 'game', 'timePointer');
      });
    });

    it('should return an array of timeline events', function() {
      const tl = app.$gameStats.activeTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);

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

    it('should contain 24 elements when timePointer is set to default (now)', function() {
      const timePointer = (new Date).getTime();
      const tl = app.$gameStats.activeTimeline(fixtures.timeline, fixtures.gameSettings, timePointer);
      assert.lengthOf(tl, 24);
    })

    it('should never contain a stop action', function() {
      const tl = app.$gameStats.activeTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      const validate = (tli) => {
        assert.notPropertyVal(tli, 'action', 'stop');
      }
      R.forEach(validate, tl);
    });

    it('should contain 6 elements when timePointer is set to 1544244988308', function() {
      const timePointer = 1544244988308;
      const tl = app.$gameStats.activeTimeline(fixtures.timeline, fixtures.gameSettings, timePointer);
      assert.lengthOf(tl, 6);
    });

    it('should contain 3 elements (runningTimeline)', function() {
      const timePointer = 4701341506760;
      const tl = app.$gameStats.activeTimeline(fixtures.runningTimeline, fixtures.gameSettings, timePointer);
      assert.lengthOf(tl, 3);
    });

  });


  describe('cleansedTimeline()', function() {
    it('should return an array of timeline events without duplicate neighboring actions', function() {
      const tl = app.$gameStats.cleansedTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);

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
            R.prop('action', allTl[idx + 1]),
            'A duplicate timeline action was found in cleansedTimeline\'s output!'
          )
        )
      };

      const forEachIdx = R.addIndex(R.forEach);
      forEachIdx(validate, tl);
    });

    it('should have 30 elements', function() {
      const tl = app.$gameStats.cleansedTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      assert.lengthOf(tl, 30);
    });

    it('should have chronologically sorted events', function() {
      const tl = app.$gameStats.cleansedTimeline(fixtures.timeline, fixtures.gameSettings, fixtures.timePointer);
      var lastTimestamp = 0;
      const validate = (tli) => {
        const thisTimestamp = R.prop('createdAt', tli);
        assert.isAbove(thisTimestamp, lastTimestamp);
        lastTimestamp = R.prop('createdAt', tli);
      }
      R.forEach(validate, tl);
    });
  });


  describe('cleansedPressData()', function() {
    const validate = (pdi, idx, allPd) => {
      const createdAt = parseInt(R.prop('createdAt', pdi));
      assert.property(pdi, 'type');
      assert.property(pdi, 'action');
      assert.property(pdi, 'source');
      assert.property(pdi, 'target');
      assert.property(pdi, 'createdAt');
      assert.property(pdi, '_id');
      R.unless(
        R.equals(allPd.length, idx),
        assert.notEqual(
          R.prop('action', pdi),
          R.prop('action', allPd[idx + 1]),
          'A duplicate pressData action was found in cleansedPressData\'s output!'
        )
      )
    };

    it('should return an array of press data events without duplicate neighboring actions (dupControlpointPressData)', function() {
      const pd = gameStats.cleansedPressData(fixtures.dupControlpointPressData);
      assert.isArray(pd);
      const forEachIdx = R.addIndex(R.forEach);
      forEachIdx(validate, pd);
    });

    it('should return an array of press data events without duplicate neighboring actions (controlpointPressData)', function() {
      const pd = gameStats.cleansedPressData(fixtures.controlpointPressData);
      assert.isArray(pd);
      const forEachIdx = R.addIndex(R.forEach);
      forEachIdx(validate, pd);
    });

    it('should have n elements (controlpointPressData)', function() {
      const pd = gameStats.cleansedPressData(fixtures.controlpointPressData);
      assert.lengthOf(pd, 6);
    });

    it('should have n elements (dupControlpointPressData)', function() {
      const pd = gameStats.cleansedPressData(fixtures.dupControlpointPressData);
      assert.lengthOf(pd, 6);
    });

    it('should have chronologically sorted events', function() {
      const pd = gameStats.cleansedPressData(fixtures.dupControlpointPressData);
      var lastTimestamp = 0;
      const validate = (pdi) => {
        const thisTimestamp = R.prop('createdAt', pdi);
        assert.isAbove(thisTimestamp, lastTimestamp);
        lastTimestamp = R.prop('createdAt', pdi);
      }
      R.forEach(validate, pd);
    });
  });




  describe('calculatePressProgress()', function() {
    it('should return an object with red and blu progress integers between 0 and 100', function() {
      const progress = gameStats.calculatePressProgress(fixtures.controlpointPressData);
      assert.isObject(progress);
      assert.isNumber(progress.red);
      assert.isNumber(progress.blu);
      assert.equal(progress.red, 20, 'red value is unexpected'); // 5437 / 5000 = 1.0874
      assert.equal(progress.blu, 0, 'blu value is unexpected'); // 1264 / 5000 = 0.2528
    });

    it('should show red progress OR blu progress, never both.', function() {
      const progress = gameStats.calculatePressProgress(fixtures.controlpointPressData);
      assert.isObject(progress);
      assert.isFalse(
        R.and(
          R.gt(progress.red, 0),
          R.gt(progress.blu, 0)
        )
      , 'both red progress and blu progress were greater than zero, but only one should be greater than zero.');
    });

    xit('should take gameStatus (paused|started) into account')
  });
});
