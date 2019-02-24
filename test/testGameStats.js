const assert = require('chai').assert;
const gameStats = require('../src_shared/gameStats.js');
const fixtures = require('../fixtures');
const Promise = require('bluebird');
const R = require('ramda');
const Vue = require('vue');
const moment = require('moment');


describe('gameStats', function() {

  var app;
  beforeEach(function() {
    app = new Vue();
    Vue.use(gameStats);
  });

  describe('helpers', function() {
    describe('parseMetadata', function() {
      it('should return raw values and moments in a tuple', function() {
        const {
          rgt,
          gst,
          get,
          gpd,
          ged,
          grd,
          mt,
          gl,
          cr,
          mrgt,
          mgst,
          mget,
          mgpd,
          mged,
          mgrd,
          mmt,
          mgl,
          mcr
        } = gameStats.parseMetadata(fixtures.initialMetadata);
        assert.isNull(rgt);
        assert.isNull(gst);
        assert.equal(gpd, 0);
        assert.equal(ged, 0);
        assert.equal(grd, 0);
        assert.isNull(get);
        assert.equal(mt, 1547072420007);
        assert.equal(gl, 7200000);
        assert.equal(cr, 5000);

        assert.isTrue(moment.isDuration(mrgt));
        assert.isTrue(moment.isMoment(mgst));
        assert.isTrue(moment.isDuration(mgpd));
        assert.isTrue(moment.isDuration(mged));
        assert.isTrue(moment.isDuration(mgrd));
        assert.isTrue(moment.isMoment(mget));
        assert.isTrue(moment.isMoment(mmt));
        assert.isTrue(moment.isDuration(mgl));
        assert.isTrue(moment.isDuration(mcr));

      });
    });

    describe('isOdd', function() {
      it('should return true for a odd number', function() {
        const oddResult = gameStats.isOdd(5);
        assert.isTrue(oddResult);
      });
      it('should return false for a even number', function() {
        const evenResult = gameStats.isOdd(2);
        assert.isFalse(evenResult);
      });
    });

    describe('isEven', function() {
      it('should return true for an even number', function() {
        const evenResult = gameStats.isEven(2);
        assert.isTrue(evenResult);
      });
      it('should return false for an odd number', function() {
        const oddResult = gameStats.isEven(5);
        assert.isFalse(oddResult);
      });
    })

    describe('isRed', function() {
      it('should return true for cap_red or release_red or press_red', function() {
        const capRed = gameStats.isRed({
          action: 'cap_red'
        });
        const releaseRed = gameStats.isRed({
          action: 'release_red'
        });
        const pressRed = gameStats.isRed({
          action: 'press_red'
        });
        assert.isTrue(capRed);
        assert.isTrue(releaseRed);
        assert.isTrue(pressRed);
      });

      it('should return false for cap_blu or release_blu or press_blu', function() {
        const capBlu = gameStats.isRed({
          action: 'cap_blu'
        });
        const releaseBlu = gameStats.isRed({
          action: 'release_blu'
        });
        const pressBlu = gameStats.isRed({
          action: 'press_blu'
        });
        assert.isFalse(capBlu);
        assert.isFalse(releaseBlu);
        assert.isFalse(pressBlu);
      });
    });

    describe('isBlu', function() {
      it('should return true for cap_blu or release_blu or press_blu', function() {
        const capBlu = gameStats.isBlu({
          action: 'cap_blu'
        });
        const releaseBlu = gameStats.isBlu({
          action: 'release_blu'
        });
        const pressBlu = gameStats.isBlu({
          action: 'press_blu'
        });
        assert.isTrue(capBlu);
        assert.isTrue(releaseBlu);
        assert.isTrue(pressBlu);
      });

      it('should return false for cap_red or release_red or press_red', function() {
        const capRed = gameStats.isBlu({
          action: 'cap_red'
        });
        const releaseRed = gameStats.isBlu({
          action: 'release_red'
        });
        const pressRed = gameStats.isBlu({
          action: 'press_red'
        });
        assert.isFalse(capRed);
        assert.isFalse(releaseRed);
        assert.isFalse(pressRed);
      });
    });

    describe('isLifeCycleEvent', function() {
      it('should return true for start, stop, or pause events', function() {
        const start = gameStats.isLifeCycleEvent({
          action: 'start'
        });
        const stop = gameStats.isLifeCycleEvent({
          action: 'stop'
        });
        const pause = gameStats.isLifeCycleEvent({
          action: 'pause'
        });
        assert.isTrue(start);
        assert.isTrue(stop);
        assert.isTrue(pause);
      });
    });

    describe('isProgressEvent', function() {
      it('should return true for cap_*, press_*, or release_* events', function() {
        const capUnc = gameStats.isProgressEvent({
          action: 'cap_unc'
        });
        const pressRed = gameStats.isProgressEvent({
          action: 'press_red'
        });
        const releaseRed = gameStats.isProgressEvent({
          action: 'release_red'
        });
        const capRed = gameStats.isProgressEvent({
          action: 'cap_red'
        });
        const pressBlu = gameStats.isProgressEvent({
          action: 'press_blu'
        });
        const releaseBlu = gameStats.isProgressEvent({
          action: 'release_blu'
        });
        const capBlu = gameStats.isProgressEvent({
          action: 'cap_blu'
        });
        assert.isTrue(capUnc);
        assert.isTrue(pressRed);
        assert.isTrue(releaseRed);
        assert.isTrue(capUnc);
        assert.isTrue(pressBlu);
        assert.isTrue(releaseBlu);
        assert.isTrue(capBlu);
      });

      it('should return false for start, stop, pause events', function() {
        const pause = gameStats.isProgressEvent({
          action: 'pause'
        });
        const start = gameStats.isProgressEvent({
          action: 'start'
        });
        const stop = gameStats.isProgressEvent({
          action: 'stop'
        });
        assert.isFalse(pause);
        assert.isFalse(start);
        assert.isFalse(stop);
      });
    });

    describe('isStopEvent', function() {
      it('should return true for stop events', function() {
        const stop = gameStats.isStopEvent({
          action: 'stop'
        });
        assert.isTrue(stop);
      });
      it('should return false for other events', function() {
        const pause = gameStats.isStopEvent({
          action: 'pause'
        });
        const start = gameStats.isStopEvent({
          action: 'start'
        });
        const cap = gameStats.isStopEvent({
          action: 'cap_blu'
        });
        const press = gameStats.isStopEvent({
          action: 'press_red'
        });
        const release = gameStats.isStopEvent({
          action: 'release_red'
        });
        assert.isFalse(pause);
        assert.isFalse(start);
        assert.isFalse(cap);
        assert.isFalse(press);
        assert.isFalse(release);
      });
    });

    describe('isStartEvent', function() {
      it('should return true for start events', function() {
        const start = gameStats.isStartEvent({
          action: 'start'
        });
        assert.isTrue(start);
      });
      it('should return false for other events', function() {
        const pause = gameStats.isStartEvent({
          action: 'pause'
        });
        const stop = gameStats.isStartEvent({
          action: 'stop'
        });
        const cap = gameStats.isStartEvent({
          action: 'cap_blu'
        });
        const press = gameStats.isStartEvent({
          action: 'press_red'
        });
        const release = gameStats.isStartEvent({
          action: 'release_red'
        });
        assert.isFalse(pause);
        assert.isFalse(stop);
        assert.isFalse(cap);
        assert.isFalse(press);
        assert.isFalse(release);
      });
    });


    describe('isPauseEvent', function() {
      it('should return true for pause events', function() {
        const pause = gameStats.isPauseEvent({
          action: 'pause'
        });
        assert.isTrue(pause);
      });
      it('should return false for other events', function() {
        const start = gameStats.isPauseEvent({
          action: 'start'
        });
        const stop = gameStats.isPauseEvent({
          action: 'stop'
        });
        const cap = gameStats.isPauseEvent({
          action: 'cap_blu'
        });
        const press = gameStats.isPauseEvent({
          action: 'press_red'
        });
        const release = gameStats.isPauseEvent({
          action: 'release_red'
        });
        assert.isFalse(start);
        assert.isFalse(stop);
        assert.isFalse(cap);
        assert.isFalse(press);
        assert.isFalse(release);
      });
    });

    describe('isPausedMetadata', function() {
      it('should return true when passed metadata object has gameStatus.msg equalling paused', function() {
        const paused = gameStats.isPausedMetadata({
          gameStatus: {
            msg: 'paused'
          }
        });
        assert.isTrue(paused);
      });
      it('should return false for other metadata gameStatuses', function() {
        const stopped = gameStats.isPausedMetadata({
          gameStatus: {
            msg: 'stopped'
          }
        });
        const running = gameStats.isPausedMetadata({
          gameStatus: {
            msg: 'running'
          }
        });
        const over = gameStats.isPausedMetadata({
          gameStatus: {
            msg: 'over'
          }
        });
        assert.isFalse(stopped);
        assert.isFalse(running);
        assert.isFalse(over);
      });
    });

    describe('isRunningMetadata', function() {
      it('should return true when passed metadata object has gameStatus.msg equalling running', function() {
        const running = gameStats.isRunningMetadata({
          gameStatus: {
            msg: 'running'
          }
        });
        assert.isTrue(running);
      });
      it('should return false for other metadata gameStatuses', function() {
        const stopped = gameStats.isRunningMetadata({
          gameStatus: {
            msg: 'stopped'
          }
        });
        const paused = gameStats.isRunningMetadata({
          gameStatus: {
            msg: 'paused'
          }
        });
        const over = gameStats.isRunningMetadata({
          gameStatus: {
            msg: 'over'
          }
        });
        assert.isFalse(stopped);
        assert.isFalse(paused);
        assert.isFalse(over);
      });
    });

    describe('isOverMetadata', function() {
      it('should return true when passed metadata object has gameStatus.msg equalling over', function() {
        const over = gameStats.isOverMetadata({
          gameStatus: {
            msg: 'over'
          }
        });
        assert.isTrue(over);
      });
      it('should return false for other metadata gameStatuses', function() {
        const stopped = gameStats.isOverMetadata({
          gameStatus: {
            msg: 'stopped'
          }
        });
        const paused = gameStats.isOverMetadata({
          gameStatus: {
            msg: 'paused'
          }
        });
        const running = gameStats.isOverMetadata({
          gameStatus: {
            msg: 'running'
          }
        });
        assert.isFalse(stopped);
        assert.isFalse(paused);
        assert.isFalse(running);
      });
    });
    describe('isStoppedMetadata', function() {
      it('should return true when passed metadata object has gameStatus.msg equalling stopped', function() {
        const stopped = gameStats.isStoppedMetadata({
          gameStatus: {
            msg: 'stopped'
          }
        });
        assert.isTrue(stopped);
      });
      it('should return false for other metadata gameStatuses', function() {
        const over = gameStats.isStoppedMetadata({
          gameStatus: {
            msg: 'over'
          }
        });
        const paused = gameStats.isStoppedMetadata({
          gameStatus: {
            msg: 'paused'
          }
        });
        const running = gameStats.isStoppedMetadata({
          gameStatus: {
            msg: 'running'
          }
        });
        assert.isFalse(over);
        assert.isFalse(paused);
        assert.isFalse(running);
      });
    });

  });

  describe('pad', function() {
    it('should ensure input string outputs as default 8 spaces', function() {
      const output = gameStats.pad('hi');
      assert.lengthOf(output, 8);
    });

    it('should accept a parameter n which ensures output string is n length', function() {
      const output = gameStats.pad(20, 'hello');
      assert.lengthOf(output, 20);
    });
    it('should throw if no params received', function() {
      assert.throws(() => {
        gameStats.pad();
      });
    });
    it('should work on numbers', function() {
      const output = gameStats.pad(20, 12);
      assert.lengthOf(output, 20);
    })
  });

  describe('capPercentage', function() {
    it('should not let a number go above 100', function() {
      const capped = gameStats.capPercentage(500);
      assert.equal(capped, 100);
    });
    it('should not let a number go below 0', function() {
      const capped = gameStats.capPercentage(-200);
      assert.equal(capped, 0);
    });
  });

  describe('teamProgressCompute()', function() {
    it('should cope with an empty origin object', function() {
      const origin = {};
      const delta = {
        red: 0,
        blu: 50
      };
      const score = gameStats.teamProgressCompute(origin, delta);
      assert.deepEqual(score, {
        red: 0,
        blu: 50
      })
    });
    it('should cope with an undefined origin object', function() {
      const origin = undefined;
      const delta = {
        red: 0,
        blu: 50
      };
      const score = gameStats.teamProgressCompute(origin, delta);
      assert.deepEqual(score, {
        red: 0,
        blu: 50
      })
    });
    it('should subtract the controlling team progress when opposing team holds button', function() {
      const origin = {
        red: 100,
        blu: 0
      };
      const delta = {
        red: 0,
        blu: 50
      };
      const score = gameStats.teamProgressCompute(origin, delta);
      assert.deepEqual(score, {
        red: 50,
        blu: 0
      });
    });

    it('should increment the capturing teams progress when the opposing teams progress is 0', function() {
      const origin = {
        red: 0,
        blu: 0
      };
      const delta = {
        red: 0,
        blu: 50
      };
      const score = gameStats.teamProgressCompute(origin, delta);
      assert.deepEqual(score, {
        red: 0,
        blu: 50
      });
    });

    it('should flip the score when red origin is 100 but then blu comes along with a delta of 200', function() {
      const origin = {
        red: 100,
        blu: 0
      };
      const delta = {
        red: 0,
        blu: 200
      };
      const score = gameStats.teamProgressCompute(origin, delta);
      assert.deepEqual(score, {
        red: 0,
        blu: 100
      });
    });

    it('should be a gentle bb', function() {
      const origin = {
        red: 100,
        blu: 0
      };
      const delta = {
        red: 0,
        blu: 125
      };
      const score = gameStats.teamProgressCompute(origin, delta);
      assert.deepEqual(score, {
        red: 0,
        blu: 25
      });
    });

    it('should throw if not receiving 2 params', function() {
      const origin = {
        red: 100,
        blu: 0
      };
      assert.throws(() => {
        gameStats.teamProgressCompute();
      }, /two parameters/);
      assert.throws(() => {
        gameStats.teamProgressCompute(origin);
      }, /two parameters/);
    });
  });


  describe('buildInitialMetadata()', function() {
    it('should accept {Object} gameSettings and return initial metadata defaults', function() {
      const initialMetadata = gameStats.buildInitialMetadata(fixtures.gameSettings);
      assert.isObject(initialMetadata);
      assert.deepEqual(initialMetadata, {
        gameStatus: {
          msg: 'stopped',
          code: 3
        },
        remainingGameTime: null,
        gameStartTime: null,
        gamePausedDuration: 0,
        gameElapsedDuration: 0,
        gameRunningDuration: 0,
        gameEndTime: null,
        devicesProgress: [],
        score: {
          blu: 0,
          bluTotalControlledTime: 0,
          devicesScores: [],
          red: 0,
          redTotalControlledTime: 0,
        },
        metadataTimestamp: null,
        gameLength: 7200000,
        captureRate: 5000
      });
    });

    it('should throw if not receiving gameSettings', function() {
      assert.throws(() => {
        gameStats.buildInitialMetadata();
      }, /parameter/);
    });
  });

  describe('deriveMetadata()', function() {
    it('should accept {Object} prevous metadata and {Object} timeline event as parameters', function() {
      const metadata = gameStats.deriveMetadata(fixtures.startedMetadata, fixtures.stopEvent);
      assert.isObject(metadata);
      assert.isNumber(metadata.gamePausedDuration);
    });

    it('should throw if receiving less than two parameters', function() {
      assert.throws(() => {
        gameStats.deriveMetadata();
      });
      assert.throws(() => {
        gameStats.deriveMetadata({});
      });
    });

    it('Should throw when lastMetadata is not complete. ', function() {
      assert.throws(() => {
        const metadata = gameStats.deriveMetadata({}, fixtures.stopEvent);
      }, /valid/);
    });
  });


  describe('calculateMetadata()', function() {
    it('should compute the answer to life, the universe, and everything.', function() {
      const metadata = gameStats.calculateMetadata(fixtures.stoplessTimeline, fixtures.gameSettings);
      assert.isObject(metadata);
      assert.isObject(metadata.gameStatus);
      assert.isNumber(metadata.remainingGameTime);
      assert.isNumber(metadata.gameStartTime);
      assert.isNumber(metadata.gamePausedDuration);
      assert.isNumber(metadata.gameElapsedDuration);
      assert.isNumber(metadata.gameRunningDuration);
      assert.isNumber(metadata.gameEndTime);
      assert.isNumber(metadata.gameLength);
      assert.propertyVal(metadata, 'theAnswer', 42);
      assert.isArray(metadata.devicesProgress);
      assert.lengthOf(metadata.devicesProgress, 2);
      const validate = (t) => {
        assert.isObject(t);
        assert.isNumber(t.blu);
        assert.isNumber(t.red);
        assert.isBelow(t.blu, 101, 'blu is too high, should be 0-100');
        assert.isBelow(t.red, 101, 'red is too high, should be 0-100');
        assert.isAbove(t.blu, -1, 'blu is too low, should be 0-100');
        assert.isAbove(t.red, -1, 'red is too low, should be 0-100');
        assert.isString(t.targetId, 'returned progress object should have a targetId prop');
      }
      R.forEach(validate, metadata.devicesProgress);
    });

    it('should correctly compute the metadata after the first event.', function() {
      const metadata = gameStats.calculateMetadata(fixtures.stoplessTimeline, fixtures.gameSettings, 1546120347408);
      assert.isObject(metadata);
      assert.isObject(metadata.gameStatus);
      assert.deepEqual(metadata.gameStatus, {
        msg: 'running',
        code: 0
      });
      assert.isNumber(metadata.remainingGameTime);
      assert.propertyVal(metadata, 'remainingGameTime', 7200000);
      assert.isNumber(metadata.gameStartTime);
      assert.propertyVal(metadata, 'gameStartTime', 1546120347408);
      assert.isNumber(metadata.gamePausedDuration);
      assert.propertyVal(metadata, 'gamePausedDuration', 0);
      assert.isNumber(metadata.gameElapsedDuration);
      assert.propertyVal(metadata, 'gameElapsedDuration', 0);
      assert.isNumber(metadata.gameRunningDuration);
      assert.propertyVal(metadata, 'gameRunningDuration', 0);
      assert.isNumber(metadata.gameEndTime);
      assert.propertyVal(metadata, 'gameEndTime', 1546127547408);
      assert.isNumber(metadata.gameLength);
      assert.propertyVal(metadata, 'gameLength', 7200000);
      assert.propertyVal(metadata, 'theAnswer', 42);
      assert.isArray(metadata.devicesProgress);
      assert.lengthOf(metadata.devicesProgress, 0);
    });

    it('should respect the timePointer parameter', function() {
      const tp = 1546127512637;
      const metadata = gameStats.calculateMetadata(fixtures.largeControlpointPressData, fixtures.gameSettings, tp);
      const hg9 = R.find(R.propEq('targetId', 'hG9RdwPn1HH4bZLk'), metadata.devicesProgress);
      assert.isObject(metadata);
      assert.isObject(hg9);
      assert.property(hg9, 'red');
      assert.property(hg9, 'blu');
      assert.propertyVal(hg9, 'red', 100);
      assert.propertyVal(hg9, 'blu', 0);
    });

    it('should know that at n, blu/red progress was 100/0, remaining game time was n, and gameStatus was running.', function() {
      const metadata = gameStats.calculateMetadata(fixtures.largeControlpointPressData, fixtures.gameSettings);

    });

  });

  describe('deriveGameStatus()', function() {
    // running, paused, over, stopped -- 0, 1, 2, 3
    it('should show running while remainingGameTime is above 0', function() {
      const metadata = {
        "gameStatus": {
          "msg": "running",
          "code": 0
        },
        "remainingGameTime": 4540,
        "gameStartTime": 1548706437997,
        "gamePausedDuration": 19085,
        "gameElapsedDuration": 19545,
        "gameRunningDuration": 460,
        "gameEndTime": 1548706443068,
        "devicesProgress": [],
        "metadataTimestamp": 1548706457542,
        "gameLength": 5000,
        "captureRate": 1000,
        "theAnswer": 42
      };
      const startEvent = {
        "action": "start",
        "createdAt": 1548706457927
      };
      const gameStatus = gameStats.deriveGameStatus(metadata, startEvent);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 0);
      assert.equal(gameStatus.msg, 'running');
    });

    it('should accept lastStepMetadata and thisStepEvent as arguments', function() {
      const gameStatus = gameStats.deriveGameStatus(fixtures.initialMetadata, fixtures.largeControlpointPressData[0]);
      assert.isObject(gameStatus);
      assert.isString(gameStatus.msg);
      assert.isNumber(gameStatus.code);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.deriveGameStatus();
      });
    });

    it('should return running when thisStepEvent action is start', function() {
      const gameStatus = gameStats.deriveGameStatus(fixtures.stoppedMetadata, fixtures.largeControlpointPressData[0]);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 0);
      assert.equal(gameStatus.msg, 'running');
    });

    it('should return \'running\' when the thisStepEvent timestamp is less than (before) gameEndTime', function() {
      const gameStatus = gameStats.deriveGameStatus(fixtures.stoppedMetadata, fixtures.timelineShortSweet[0]);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 0);
      assert.equal(gameStatus.msg, 'running');
    });

    it('should return \'paused\' when the thisStepEvent action is pause', function() {
      const metadata = {
        gameStatus: {
          msg: 'running',
          code: 0
        },
        remainingGameTime: null,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 0,
        gameRunningDuration: 0,
        gameEndTime: null,
        devicesProgress: [],
        metadataTimestamp: 5000,
        gameLength: 7200000,
        captureRate: 5000,
      };
      const event = {
        action: 'pause',
        createdAt: 10000
      };
      const gameStatus = gameStats.deriveGameStatus(metadata, event);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 1);
      assert.equal(gameStatus.msg, 'paused');
    });

    it('should not allow pausing the game when the game is stopped', function() {
      const pauseEvent = fixtures.timelineShortSweet[3];
      const gameStatus = gameStats.deriveGameStatus(fixtures.stoppedMetadata, pauseEvent);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 3);
      assert.equal(gameStatus.msg, 'stopped');
    });

    it('should not allow pausing the game when the game is over', function() {
      const pauseEvent = fixtures.timelineShortSweet[3];
      const gameStatus = gameStats.deriveGameStatus(fixtures.overMetadata, pauseEvent);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 2);
      assert.equal(gameStatus.msg, 'over');
    });

    it('should not allow starting the game when the game is over', function() {
      const startEvent = fixtures.timelineShortSweet[0];
      const gameStatus = gameStats.deriveGameStatus(fixtures.overMetadata, startEvent);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 2);
      assert.equal(gameStatus.msg, 'over');
    });

    it('should return \'running\' when resuming from a pause which was longer than the gameLength', function() {
      const metadata = {
        "gameStatus": {
          "msg": "paused",
          "code": 1
        },
        "remainingGameTime": 893408,
        "gameStartTime": 1548700792486,
        "gamePausedDuration": 23103,
        "gameElapsedDuration": 29695,
        "gameRunningDuration": 6592,
        "gameEndTime": 1548701692507,
        "devicesProgress": [],
        "metadataTimestamp": 1548700822181,
        "gameLength": 900000,
        "captureRate": 5000,
        "theAnswer": 42
      };
      const startEvent = {
        action: 'start',
        createdAt: 1548701741379
      };
      const gameStatus = gameStats.deriveGameStatus(metadata, startEvent);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 0);
      assert.equal(gameStatus.msg, 'running');
    });

    it('should return \'paused\' when the game is paused, even if the gameEndTime has passed', function() {
      const metadata = {
        "gameStatus": {
          "msg": "paused",
          "code": 1
        },
        "remainingGameTime": 3701,
        "gameStartTime": 1548703652522,
        "gamePausedDuration": 3144,
        "gameElapsedDuration": 4443,
        "gameRunningDuration": 1299,
        "gameEndTime": 1548703657526,
        "devicesProgress": [],
        "metadataTimestamp": 1548703656965,
        "gameLength": 5000,
        "captureRate": 1000,
        "theAnswer": 42
      };
      const pauseEvent = {
        action: 'pause',
        createdAt: 1548703658104
      };
      const gameStatus = gameStats.deriveGameStatus(metadata, pauseEvent);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 1);
      assert.equal(gameStatus.msg, 'paused');
    });

  });

  describe('deriveRemainingGameTime()', function() {
    const startEvt = fixtures.largeControlpointPressData[0];
    it('should throw if gameStartTime AND gameEndTime are undefined', function() {
      assert.throws(() => {
        gameStats.deriveRemainingGameTime({}, startEvt);
      }, /gameStartTime/);
    });

    it('should return null if gameStartTime or gameEndTime are null', function() {
      const remainingGameTime = gameStats.deriveRemainingGameTime(fixtures.initialMetadata, startEvt);
      assert.isNull(remainingGameTime);
    });

    it('should return the remaining game time as a number', function() {
      const remainingGameTime = gameStats.deriveRemainingGameTime(fixtures.startedMetadata, startEvt);
      assert.isNumber(remainingGameTime);
      assert.equal(remainingGameTime, 7200000);
      //1546134474574
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.deriveRemainingGameTime();
      });
    });

    it('should show zero as long as the game is over', function() {
      const tenSecondsLaterEvent = {
        "type": "timeline",
        "action": "start",
        "source": "admin",
        "target": "game",
        "createdAt": 1548140246431,
        "_id": "0ViU7egBQ9yxQJSi"
      };
      const remainingGameTime = gameStats.deriveRemainingGameTime(fixtures.aboutToEndMetadata, tenSecondsLaterEvent);
      assert.isNumber(remainingGameTime);
      assert.equal(remainingGameTime, 0)
    });

    it('should be reset by a stop event', function() {
      const remainingGameTime = gameStats.deriveRemainingGameTime(fixtures.preStopMetadata, fixtures.stopEvent);
      assert.equal(remainingGameTime, null);
    });

    it('should not increase if the game was paused at last metadata collection', function() {
      const startEvent = {
        "action": "start",
        "createdAt": fixtures.pausedLongMetadata.gameStartTime + 10000
      };
      const remainingGameTime = gameStats.deriveRemainingGameTime(fixtures.pausedLongMetadata, startEvent);
      assert.equal(remainingGameTime, fixtures.pausedLongMetadata.remainingGameTime);
    });
  });

  describe('deriveGameStartTime()', function() {
    it('should return the game start time as a ms since epoch number', function() {
      const gameStartTime = gameStats.deriveGameStartTime(fixtures.initialMetadata, fixtures.largeControlpointPressData[0]);
      assert.isNumber(gameStartTime);
      assert.equal(gameStartTime, fixtures.largeControlpointPressData[0].createdAt);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.deriveGameStartTime();
      });
    });

    it('should be able to derive start time without metadata, only requiring a stepEvent with a start action and createdAt timestamp', function() {
      const startEvent = fixtures.largeControlpointPressData[0];
      const gameStartTime = gameStats.deriveGameStartTime({}, startEvent);
      assert.isNumber(gameStartTime);
      assert.equal(gameStartTime, startEvent.createdAt);
    });

    it('should defer deriving gameStartTime if the stepEvent is not a start event', function() {
      const pauseEvent = fixtures.largeControlpointPressData[1];
      const releaseEvent = fixtures.largeControlpointPressData[2];
      const gameStartTime = gameStats.deriveGameStartTime({}, pauseEvent);
      assert.isNull(gameStartTime);

      const gameStartTime2 = gameStats.deriveGameStartTime({}, releaseEvent);
      assert.isNull(gameStartTime2);
    });

    it('should get reset to null by a stop event', function() {
      const stopEvent = {
        "type": "timeline",
        "action": "stop",
        "source": "admin",
        "target": "game",
        "createdAt": 1548142321985,
        "_id": "0ViU7egBQ9yxQJSi"
      };
      const gameStartTime = gameStats.deriveGameStartTime(fixtures.overMetadata, stopEvent);
      assert.isNull(gameStartTime);
    });
  });


  describe('deriveGamePausedDuration()', function() {

    it('should not increment when lastMetadata is running, and thisStepAction is start',
      function() {
        const runningMetadata = {

          "gameStatus": {
            "msg": "running",
            "code": 0
          },
          "remainingGameTime": 900000,
          "gameStartTime": 5000,
          "gamePausedDuration": 0,
          "gameElapsedDuration": 5000,
          "gameRunningDuration": 5000,
          "gameEndTime": 905000,
          "devicesProgress": [],
          "metadataTimestamp": 5000,
          "gameLength": 900000,
          "captureRate": 250,
          "theAnswer": 42
        };
        const startEvent = {
          "action": "start",
          "createdAt": 10000
        };
        const gamePausedDuration = gameStats.deriveGamePausedDuration(runningMetadata, startEvent);
        assert.isNumber(gamePausedDuration);
        assert.equal(gamePausedDuration, 0);
      });

    it('should return the ms that the game has been paused for (running time excluded)', function() {
      const pausedMetadata = fixtures.pausedMetadata;
      const pauseEvent = {
        "type": "timeline",
        "action": "pause",
        "source": "admin",
        "target": "game",
        "createdAt": 1548023033470,
        "_id": "0YF2iy9yxOOIwu62"
      };
      const gamePausedDuration = gameStats.deriveGamePausedDuration(pausedMetadata, pauseEvent);
      assert.isNumber(gamePausedDuration);
      assert.equal(gamePausedDuration, 950613463);
    });



    it('should increase if paused', function() {
      const pausedMetadata = {
        "gameStatus": {
          "msg": "paused",
          "code": 1
        },
        "remainingGameTime": 917360,
        "gameStartTime": 1548149130106,
        "gamePausedDuration": 0,
        "gameElapsedDuration": 0,
        "gameRunningDuration": 0,
        "gameEndTime": 1548150058448,
        "devicesProgress": [],
        "metadataTimestamp": 1548149141088,
        "gameLength": 900000,
        "captureRate": 5000,
        "theAnswer": 42
      };
      const pausedEvent = {
        "action": "start",
        "createdAt": 1548149146088
      };

      const gamePausedDuration = gameStats.deriveGamePausedDuration(pausedMetadata, pausedEvent);
      assert.isNumber(gamePausedDuration);
      assert.equal(gamePausedDuration, 5000);
    });

    it('should be reset by a stop event', function() {
      const gamePausedDuration = gameStats.deriveGamePausedDuration(fixtures.preStopMetadata, fixtures.stopEvent);
      assert.equal(gamePausedDuration, 0);
    });

    it('should be reset by a stop event when metadata is over', function() {
      const metadata = {
        "gameStatus": {
          "msg": "over",
          "code": 2
        },
        "remainingGameTime": 0,
        "gameStartTime": 1548703816208,
        "gamePausedDuration": 12175,
        "gameElapsedDuration": 14065,
        "gameRunningDuration": 1890,
        "gameEndTime": 1548703821225,
        "devicesProgress": [],
        "metadataTimestamp": 1548703833021,
        "gameLength": 5000,
        "captureRate": 5000,
        "theAnswer": 42
      };
      const stopEvent = {
        "action": "stop",
        "createdAt": 1548703834553
      };
      const gamePausedDuration = gameStats.deriveGamePausedDuration(metadata, fixtures.stopEvent);
      assert.equal(gamePausedDuration, 0);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.gamePausedDuration();
      });
    });

    it('should handle lastStepStatus:running and thisStepAction:cap_blu', function() {
      const runningMetadata = {
        gameStatus: {
          msg: 'running',
          code: 0
        },
        remainingGameTime: 7200000,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 10000,
        gameRunningDuration: 10000,
        gameEndTime: 7205000,
        devicesProgress: [],
        metadataTimestamp: 5000,
        gameLength: 7200000,
        captureRate: 5000,
      };
      const capEvent = {
        action: 'cap_blu',
        createdAt: 10000
      };
      const gamePausedDuration = gameStats.deriveGamePausedDuration(runningMetadata, capEvent);
      assert.isNumber(gamePausedDuration);
      assert.equal(gamePausedDuration, 0);
    });

    it('should handle lastStepStatus:over and thisStepAction:start', function() {
      const overMetadata = {
        gameStatus: {
          msg: 'over',
          code: 0
        },
        remainingGameTime: 0,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 5000,
        gameRunningDuration: 5000,
        gameEndTime: 10000,
        devicesProgress: [],
        metadataTimestamp: 10000,
        gameLength: 5000,
        captureRate: 250,
      };
      const startEvent = {
        action: 'start',
        createdAt: 12000
      };
      const gamePausedDuration = gameStats.deriveGamePausedDuration(overMetadata, startEvent);
      assert.isNumber(gamePausedDuration);
      assert.equal(gamePausedDuration, 0);
    });
  });

  describe('deriveGameElapsedDuration()', function() {
    it('should return the accrued gameElapsedDuration plus the ms difference between thisStepEvent.createdAt and lastStepMetadata.metadataTimestamp', function() {
      const metadata = {
        gameStatus: {
          msg: 'running',
          code: 0
        },
        remainingGameTime: 7200000,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 10000,
        gameRunningDuration: 10000,
        gameEndTime: 7205000,
        devicesProgress: [],
        metadataTimestamp: 5000,
        gameLength: 7200000,
        captureRate: 5000,
      };
      const pauseEvent = {
        action: 'pause',
        createdAt: 10000
      };
      const gameElapsedDuration = gameStats.deriveGameElapsedDuration(metadata, pauseEvent);
      assert.isNumber(gameElapsedDuration);
      assert.equal(gameElapsedDuration, 15000);
    });

    it('should return 0 if the game is not started', function() {
      const pauseEvent = fixtures.largeControlpointPressData[1];
      const gameElapsedDuration = gameStats.deriveGameElapsedDuration(fixtures.initialMetadata, pauseEvent);
      assert.isNumber(gameElapsedDuration);
      assert.equal(gameElapsedDuration, 0);
    });

    it('should be reset by a stop event', function() {
      const elapsedGameDuration = gameStats.deriveGameElapsedDuration(fixtures.preStopMetadata, fixtures.stopEvent);
      assert.equal(elapsedGameDuration, 0);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.gameElapsedDuration();
      });
    });
  });

  describe('deriveGameRunningDuration()', function() {
    it('should return 0 when encountering a stop event', function() {
      const metadata = {
        gameStatus: {
          msg: 'running',
          code: 0
        },
        remainingGameTime: 15000,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 10000,
        gameRunningDuration: 10000,
        gameEndTime: 25000,
        devicesProgress: [],
        metadataTimestamp: 10000,
        gameLength: 20000,
        captureRate: 250,
      };
      const stopEvent = {
        action: 'stop',
        createdAt: 15000
      };
      const gameRunningDuration = gameStats.deriveGameRunningDuration(metadata, stopEvent);
      assert.isNumber(gameRunningDuration);
      assert.equal(gameRunningDuration, 0);
    });

    it('should return the ms that the game has been running for (paused time excluded)', function() {
      const gameRunningDuration = gameStats.deriveGameRunningDuration(fixtures.initialMetadata, fixtures.largeControlpointPressData[1]);
      assert.isNumber(gameRunningDuration);
      assert.equal(gameRunningDuration, 0);
    });

    it('should increment the gameRunningDuration when processing lastMetadata:running & thisStepAction:pause', function() {
      const metadata = {
        gameStatus: {
          msg: 'running',
          code: 0
        },
        remainingGameTime: 15000,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 10000,
        gameRunningDuration: 10000,
        gameEndTime: 25000,
        devicesProgress: [],
        metadataTimestamp: 10000,
        gameLength: 20000,
        captureRate: 250,
      };
      const pauseEvent = {
        action: 'pause',
        createdAt: 15000
      };
      const gameRunningDuration = gameStats.deriveGameRunningDuration(metadata, pauseEvent);
      assert.isNumber(gameRunningDuration);
      assert.equal(gameRunningDuration, 15000);
    });

    it('should return the same number (not increment) when paused', function() {
      const metadata = {
        gameStatus: {
          msg: 'paused',
          code: 1
        },
        remainingGameTime: 15000,
        gameStartTime: 5000,
        gamePausedDuration: 10000,
        gameElapsedDuration: 10000,
        gameRunningDuration: 0,
        gameEndTime: 25000,
        devicesProgress: [],
        metadataTimestamp: 10000,
        gameLength: 20000,
        captureRate: 250,
      };
      const pauseEvent = {
        action: 'pause',
        createdAt: 15000
      };
      const gameRunningDuration = gameStats.deriveGameRunningDuration(metadata, pauseEvent);
      assert.isNumber(gameRunningDuration);
      assert.equal(gameRunningDuration, 0);
    });

    it('should increment when the game is running', function() {
      const metadata = {
        gameStatus: {
          msg: 'running',
          code: 0
        },
        remainingGameTime: 20000,
        gameStartTime: 5000,
        gamePausedDuration: 0,
        gameElapsedDuration: 0,
        gameRunningDuration: 0,
        gameEndTime: 25000,
        devicesProgress: [],
        metadataTimestamp: 5000,
        gameLength: 20000,
        captureRate: 250,
      };
      const startEvent = {
        action: 'start',
        createdAt: 15000
      };
      const gameRunningDuration = gameStats.deriveGameRunningDuration(metadata, startEvent);
      assert.isNumber(gameRunningDuration);
      assert.equal(gameRunningDuration, 10000);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.gameRunningDuration();
      });
    });
  });


  describe('deriveGameEndTime()', function() {
    it('should cope with a default gameEndTime of null', function() {
      const startEvent = fixtures.largeControlpointPressData[0];
      const endTimestamp = fixtures.startingMetadata.gameStartTime + fixtures.startingMetadata.gameLength;
      const gameEndTime = gameStats.deriveGameEndTime(fixtures.startingMetadata, startEvent);
      assert.isNumber(gameEndTime);
      assert.equal(gameEndTime, endTimestamp);
    });
    it('should return the timestamp of the time at which the game will end', function() {
      const gameEndTime = gameStats.deriveGameEndTime(fixtures.pressedMetadata, fixtures.largeControlpointPressData[1]);
      assert.isNumber(gameEndTime);
      assert.equal(gameEndTime, 1547079620007);
    });

    it('should return the timestamp of the time at which the game will end', function() {
      const gameEndTime = gameStats.deriveGameEndTime(fixtures.pressedMetadata, fixtures.largeControlpointPressData[0]);
      assert.isNumber(gameEndTime);
      assert.equal(gameEndTime, 1547079620007);
    });

    it('should return null if the gameStartTime is null', function() {
      const nullStartMetadata = {
        gameStatus: {
          msg: 'stopped',
          code: 3
        },
        remainingGameTime: null,
        gameStartTime: null,
        gamePausedDuration: 0,
        gameElapsedDuration: 0,
        gameRunningDuration: 0,
        gameEndTime: null,
        devicesProgress: [],
        metadataTimestamp: 1547072420007,
        gameLength: 7200000,
        captureRate: 5000
      };
      const gameEndTime = gameStats.deriveGameEndTime(nullStartMetadata, fixtures.largeControlpointPressData[0]);
      assert.isNull(gameEndTime);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.deriveGameEndTime();
      });
    });

    it('should recalculate after a stop then start event', function() {
      //const gameEndTime = gameStats.deriveGameEndTime(fixtures.overMetadata, startEvent);
      //assert.
    });
  });


  describe('deriveDevicesProgress()', function() {
    it('should return an array of device progress objects', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.initialMetadata, fixtures.largeControlpointPressData[1]);
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 0);
    });
    it('should show the appropriate values after a release_blu action', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.pressedMetadata, fixtures.largeControlpointPressData[15])
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 1);
      assert.isNull(devicesProgress[0].bluPressTime);
      assert.equal(devicesProgress[0].redPressTime, 1546277128992);
      assert.propertyVal(devicesProgress[0], 'targetId', 'hG9RdwPn1HH4bZLk');
    });
    it('should show the appropriate values after a press_red action', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.initialMetadata, fixtures.timelinePressRelease[0])
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 1);
      const correctAnswer = [{
        targetId: 'hG9RdwPn1HH4bZLk',
        redPressTime: 1546277128992,
        bluPressTime: null,
        red: 0,
        blu: 0
      }, ];
      assert.deepEqual(devicesProgress, correctAnswer);
      assert.propertyVal(devicesProgress[0], 'targetId', 'hG9RdwPn1HH4bZLk');
    });

    it('should show the appropriate values after a release_red action', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.pressedMetadata, fixtures.timelinePressRelease[1])
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 1);
      assert.isNull(devicesProgress[0].redPressTime);
      assert.isNull(devicesProgress[0].bluPressTime);
      assert.equal(devicesProgress[0].red, 100);
      assert.equal(devicesProgress[0].blu, 0);
      assert.propertyVal(devicesProgress[0], 'targetId', 'hG9RdwPn1HH4bZLk');
    });

    it('should return an array containing device progress objects when evaluating an admin cap_red action', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.initialMetadata, fixtures.largeControlpointPressData[13]);
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 1);
      assert.property(devicesProgress[0], 'targetId');
      assert.property(devicesProgress[0], 'red');
      assert.property(devicesProgress[0], 'blu');
      assert.propertyVal(devicesProgress[0], 'targetId', 'hG9RdwPn1HH4bZLk');
      assert.propertyVal(devicesProgress[0], 'blu', 0);
      assert.propertyVal(devicesProgress[0], 'red', 100);
    });

    it('should return an array containing device progress objects when evaluating an admin cap_blu action', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.initialMetadata, fixtures.largeControlpointPressData[97]);
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 1);
      assert.property(devicesProgress[0], 'targetId');
      assert.property(devicesProgress[0], 'red');
      assert.property(devicesProgress[0], 'blu');
      assert.propertyVal(devicesProgress[0], 'targetId', 'hG9RdwPn1HH4bZLk');
      assert.propertyVal(devicesProgress[0], 'blu', 100);
      assert.propertyVal(devicesProgress[0], 'red', 0);
    });

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.deriveDevicesProgress();
      });
    });

    it('should show red progress at 100', function() {
      const metadata = {
        "gameStatus": {
          "msg": "running",
          "code": 0
        },
        "remainingGameTime": 19000,
        "gameStartTime": 5000,
        "gamePausedDuration": 0,
        "gameElapsedDuration": 1000,
        "gameRunningDuration": 1000,
        "gameEndTime": 25000,
        "devicesProgress": [{
          "red": 0,
          "blu": 0,
          "bluPressTime": null,
          "redPressTime": null,
          "targetId": "7eKvFstnIIvx4dJg",
        }],
        "metadataTimestamp": 6000,
        "gameLength": 20000,
        "captureRate": 1000,
        "theAnswer": 42
      };
      const pressEvent = {
        "action": "press_red",
        "targetId": "7eKvFstnIIvx4dJg",
        "createdAt": 6000
      };
      const devicesProgress = gameStats.deriveDevicesProgress(metadata, pressEvent);
      assert.isArray(devicesProgress);
      assert.deepEqual(devicesProgress, [{
        "red": 0,
        "blu": 0,
        "bluPressTime": null,
        "redPressTime": 6000,
        "targetId": "7eKvFstnIIvx4dJg"
      }]);

      const metadata2 = {
        "gameStatus": {
          "msg": "running",
          "code": 0
        },
        "remainingGameTime": 17000,
        "gameStartTime": 5000,
        "gamePausedDuration": 0,
        "gameElapsedDuration": 3000,
        "gameRunningDuration": 3000,
        "gameEndTime": 25000,
        "devicesProgress": [{
          "red": 0,
          "blu": 0,
          "bluPressTime": null,
          "redPressTime": 6000,
          "targetId": "7eKvFstnIIvx4dJg",
        }],
        "metadataTimestamp": 6000,
        "gameLength": 20000,
        "captureRate": 1000,
        "theAnswer": 42
      };
      const releaseEvent = {
        "action": "release_red",
        "targetId": "7eKvFstnIIvx4dJg",
        "createdAt": 8000
      };
      const devicesProgress2 = gameStats.deriveDevicesProgress(metadata2, releaseEvent);
      assert.isArray(devicesProgress2);
      assert.deepEqual(devicesProgress2, [{
        "red": 100,
        "blu": 0,
        "bluPressTime": null,
        "redPressTime": null,
        "targetId": "7eKvFstnIIvx4dJg"
      }]);
    });

    it('should modify only the device stated in the event targetId', function() {
      const metadata = {
        "gameStatus": {
          "msg": "stopped",
          "code": 3
        },
        "remainingGameTime": null,
        "gameStartTime": null,
        "gamePausedDuration": 0,
        "gameElapsedDuration": 0,
        "gameRunningDuration": 0,
        "gameEndTime": null,
        "devicesProgress": [{
          "red": 0,
          "blu": 100,
          "redPressTime": null,
          "bluPressTime": null,
          "targetId": "5c6f29072b17d855cb076088"
        }],
        "metadataTimestamp": 1550789419509,
        "gameLength": 900000,
        "captureRate": 5000,
        "theAnswer": 42
      };
      const capRedEvent = {
        "action": "cap_red",
        "createdAt": 1550789437601,
        "targetId": "5c6f28f02b17d855cb076087"
      };
      const devicesProgress = gameStats.deriveDevicesProgress(metadata, capRedEvent);
      assert.isArray(devicesProgress);
      assert.equal(devicesProgress[0].red, 0);
      assert.equal(devicesProgress[0].blu, 100);
      assert.equal(devicesProgress[0].targetId, "5c6f29072b17d855cb076088");
      assert.equal(devicesProgress[1].red, 100);
      assert.equal(devicesProgress[1].blu, 0);
      assert.equal(devicesProgress[1].targetId, "5c6f28f02b17d855cb076087");
      // { "_id": "5c6f2b3d2b17d855cb076093", "metadata": { "gameStatus": { "msg": "stopped", "code": 3 }, "remainingGameTime": null, "gameStartTime": null, "gamePausedDuration": 0, "gameElapsedDuration": 0, "gameRunningDuration": 0, "gameEndTime": null, "devicesProgress": [ { "red": 0, "blu": 100, "targetId": "5c6f29072b17d855cb076088" }, { "red": 0, "blu": 100, "targetId": "5c6f28f02b17d855cb076087" } ], "metadataTimestamp": 1550789437601, "gameLength": 900000, "captureRate": 5000, "theAnswer": 42 }, "gameId": "5c6f291c2b17d855cb076089", "createdAt": 1550789437606 }
    });
  });

  describe('deriveMetadataTimestamp', function() {
    const startEvt = fixtures.stoplessTimeline[0]; // ca 1546133947779
    it('should return 1546120347408', function() {
      const ts = gameStats.deriveMetadataTimestamp(fixtures.releasedMetadata, startEvt);
      assert.isNumber(ts);
      assert.equal(ts, 1546120347408);
    });
  });

  describe('deriveDevProgress()', function() {
    const capRedEvt = fixtures.largeControlpointPressData[13];
    const capUncEvt = fixtures.largeControlpointPressData[27];
    const releaseBluEvt = fixtures.largeControlpointPressData[15]; // ca 1546133947779

    it('should accept metadata object, timeline event, and deviceId, returning an progress object', function() {
      const tid = '3J3qKsCboWqbpe2G';
      const devProgress = gameStats.deriveDevProgress(fixtures.initialMetadata, fixtures.largeControlpointPressData[13], tid);
      assert.propertyVal(devProgress, 'targetId', tid)
    });

    it('should show red: 0, blu: 0 when processing a cap_unc event', function() {
      const tid = 'hG9RdwPn1HH4bZLk';
      const devProgress = gameStats.deriveDevProgress(fixtures.initialMetadata, capUncEvt, tid);
      assert.propertyVal(devProgress, 'red', 0);
      assert.propertyVal(devProgress, 'blu', 0);
      assert.propertyVal(devProgress, 'targetId', tid);
    });

    it('should handle a cap_red followed by a cap_unc', function() {
      const tid = 'hG9RdwPn1HH4bZLk';
      const devProgress = gameStats.deriveDevProgress(fixtures.redMetadata, capUncEvt, tid);
      assert.propertyVal(devProgress, 'targetId', tid);
      assert.propertyVal(devProgress, 'blu', 0);
      assert.propertyVal(devProgress, 'red', 0);
    });

    it('should ignore release_(red|blu) events without pre-existing (red|blu)Incomplete data', function() {
      const tid = 'hG9RdwPn1HH4bZLk';
      const devProgress = gameStats.deriveDevProgress(fixtures.releasedMetadata, releaseBluEvt, tid);
      assert.propertyVal(devProgress, 'targetId', tid);
      assert.deepEqual(devProgress, {
        redPressTime: null,
        bluPressTime: null,
        targetId: tid,
        red: 43,
        blu: 0
      });
    });

    it('should throw if not receiving three arguments', function() {
      assert.throws(() => {
        gameStats.deriveDevProgress();
      });
      assert.throws(() => {
        gameStats.deriveDevProgress(fixtures.initialMetadata);
      });
      assert.throws(() => {
        gameStats.deriveDevProgress(fixtures.initialMetadata, fixtures.largeControlpointPressData[13]);
      });
    });
  });

  describe('deriveDevices()', function() {
    it('should return an Array of devices which have appeared in the timeline and current timeline event step thus far', function() {
      const devices = gameStats.deriveDevices(fixtures.initialMetadata, fixtures.timelinePressRelease[0]);
      assert.isArray(devices);
      assert.lengthOf(devices, 1);
      assert.deepEqual(devices, ['hG9RdwPn1HH4bZLk']);
    });

    it('should return an Array of devices which have appeard in the timeline and current timeline event step thus far', function() {
      const devices = gameStats.deriveDevices(fixtures.pressedMetadata, fixtures.dupControlpointPressData[0]);
      assert.isArray(devices);
      assert.lengthOf(devices, 2);
      assert.deepEqual(devices, ['hG9RdwPn1HH4bZLk', '5AEVScKzvclsCpeR']);
    });

    it('should ignore id \'unknown!\'', function() {
      const unknownTargetIdEvt = fixtures.largeControlpointPressData[164];
      const devices = gameStats.deriveDevices(fixtures.pressedMetadata, unknownTargetIdEvt);
      assert.isArray(devices);
      assert.lengthOf(devices, 1);
      assert.deepEqual(devices, ['hG9RdwPn1HH4bZLk']);
    });

    it('Should return an array with 5c6f29072b17d855cb076088 and 5c6f28f02b17d855cb076087', function() {
      const metadata = {
        "gameStatus": {
          "msg": "stopped",
          "code": 3
        },
        "remainingGameTime": null,
        "gameStartTime": null,
        "gamePausedDuration": 0,
        "gameElapsedDuration": 0,
        "gameRunningDuration": 0,
        "gameEndTime": null,
        "devicesProgress": [{
          "red": 0,
          "blu": 100,
          "redPressTime": null,
          "bluPressTime": null,
          "targetId": "5c6f29072b17d855cb076088"
        }],
        "metadataTimestamp": 1550789419509,
        "gameLength": 900000,
        "captureRate": 5000,
        "theAnswer": 42
      };

      const capBluEvent = {
        "action": "cap_red",
        "createdAt": 1550789437601,
        "targetId": "5c6f28f02b17d855cb076087"
      };

      const devices = gameStats.deriveDevices(metadata, capBluEvent);
      assert.isArray(devices);
      assert.deepEqual(devices, ['5c6f29072b17d855cb076088', '5c6f28f02b17d855cb076087']);
    });
  });

  describe('buttonReleaseDeltaCompute()', function() {
    const tid = 'hG9RdwPn1HH4bZLk';
    const releaseEvent = fixtures.timelinePressRelease[1];
    const releaseBluEvt = fixtures.largeControlpointPressData[15]; // ca 1546133947779

    it('should return an object containing the changed progress data', function() {
      const delta = gameStats.buttonReleaseDeltaCompute(fixtures.pressedMetadata, releaseEvent, tid);
      assert.isObject(delta);
      assert.deepEqual(delta, {
        red: 200,
        blu: 0,
        targetId: tid
      });
    });
    it('should return red:0, blu:0 when no (red|blu)Incomplete data exists', function() {
      const releaseEvent = fixtures.largeControlpointPressData[158]; // ca 1546277131169
      const delta = gameStats.buttonReleaseDeltaCompute(fixtures.releasedMetadata, releaseEvent, tid);
      assert.isObject(delta);
      assert.deepEqual(delta, {
        red: 0,
        blu: 0,
        targetId: tid
      });
    });
    it('should throw if captureRate is undefined', function() {
      assert.throws(() => {
        gameStats.buttonReleaseDeltaCompute(fixtures.noCaptureRateMetadata, releaseBluEvt, tid);
      }, /captureRate/);
    });
    it('should throw if not receiving 3 params', function() {
      assert.throws(() => {
        gameStats.buttonReleaseDeltaCompute();
      });
      assert.throws(() => {
        gameStats.buttonReleaseDeltaCompute(fixtures.initialMetadata);
      });
      assert.throws(() => {
        gameStats.buttonReleaseDeltaCompute(fixtures.initialMetadata, fixtures.largeControlpointPressData[13]);
      });
    });
  });

  describe('incompleteProgressCompute()', function() {
    it('should return an object containing the new incomplete progress data', function() {
      const {
        redPressTime,
        bluPressTime
      } = gameStats.incompleteProgressCompute(fixtures.pressedMetadata, fixtures.timelinePressRelease[1], 'hG9RdwPn1HH4bZLk');
      assert.isNull(redPressTime);
      assert.isNull(bluPressTime);
    });
    it('should throw if not receiving 3 params', function() {
      assert.throws(() => {
        gameStats.incompleteProgressCompute();
      });
      assert.throws(() => {
        gameStats.ute(fixtures.initialMetadata, fixtures.timelinePressRelease);
      })
    });
    it('should gracefully handle an empty redPressTime or bluPressTime', function() {
      const {
        redPressTime,
        bluPressTime
      } = gameStats.incompleteProgressCompute(fixtures.pressedMetadata, fixtures.timelinePressRelease[1], '');

    });
  });


  describe('deriveScore()', function() {
    it('should return blu 100 pts, red 0 pts.', function() {
      const now = moment();
      const metadata = {
        "gameStatus": {
          "msg": "stopped",
          "code": 3
        },
        "remainingGameTime": null,
        "gameStartTime": null,
        "gamePausedDuration": 0,
        "gameElapsedDuration": 0,
        "gameRunningDuration": 0,
        "gameEndTime": null,
        "devicesProgress": [{
          "red": 0,
          "blu": 100,
          "redPressTime": null,
          "bluPressTime": null,
          "targetId": "5c6f29072b17d855cb076088"
        }],
        "score": {
          "red": 0,
          "blu": 0
        },
        "metadataTimestamp": now.clone().subtract(1, 'minutes').valueOf(),
        "gameLength": 900000,
        "captureRate": 5000,
        "theAnswer": 42
      };
      const evt = {
        "action": "event_of_no_consequence_just_for_testing",
        "createdAt": now.valueOf()
      };
      const score = gameStats.deriveScore(metadata, evt);
      assert.propertyVal(score, 'red', 0);
      assert.propertyVal(score, 'blu', 100);
      assert.isArray(score.devicesScores);
      assert.deepEqual(score, {
        'red': 0,
        'blu': 100,
        'devicesScores': [
          {
            'red': 0,
            'blu': 100,
            'bluTotalControlledTime': 60000,
            'redTotalControlledTime': 0,
            'targetId': '5c6f29072b17d855cb076088'
          }
        ]
      })
    });
  });


});
