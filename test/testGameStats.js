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
        gameStatus: { msg: 'stopped', code: 3 },
        remainingGameTime: null,
        gameStartTime: null,
        gamePausedDuration: 0,
        gameElapsedDuration: 0,
        gameRunningDuration: 0,
        gameEndTime: null,
        devicesProgress: [],
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
          gameStatus: { msg: 'running', code: 0 },
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
      const event = { action: 'pause', createdAt: 10000 };
      const gameStatus = gameStats.deriveGameStatus(metadata, event);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 1);
      assert.equal(gameStatus.msg, 'paused');
    });

    it('should return \'over\' when the thisStepEvent timestamp is greater than (after) gameEndTime', function() {
      const gameStatus = gameStats.deriveGameStatus(fixtures.stoppedMetadata, fixtures.timelineShortSweet[5]);
      assert.isObject(gameStatus);
      assert.equal(gameStatus.code, 2);
      assert.equal(gameStatus.msg, 'over');
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
  });

  describe('deriveRemainingGameTime()', function() {
    const startEvt = fixtures.largeControlpointPressData[0];
    it('should throw if gameStartTime and gameEndTime are undefined or null', function() {
      assert.throws(() => {
        gameStats.deriveRemainingGameTime(fixtures.initialMetadata, startEvt);
      }, /gameStartTime/);
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

    it('should throw if not receiving two arguments', function() {
      assert.throws(() => {
        gameStats.gamePausedDuration();
      });
    });
  });

  describe('deriveGameElapsedDuration()', function() {
    it('should return the accrued gameElapsedDuration plus the ms difference between thisStepEvent.createdAt and lastStepMetadata.metadataTimestamp', function() {
      const metadata = {
          gameStatus: { msg: 'running', code: 0 },
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
    it('should return the ms that the game has been running for (paused time excluded)', function() {
      const gameRunningDuration = gameStats.deriveGameRunningDuration(fixtures.initialMetadata, fixtures.largeControlpointPressData[1]);
      assert.isNumber(gameRunningDuration);
      assert.equal(gameRunningDuration, 0);
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
      const endTimestamp = startingMetadata.gameStartTime + startingMetadata.gameLength;
      const gameEndTime = gameStats.deriveGameEndTime(startingMetadata, startEvent);
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
      assert.isNull(devicesProgress[0].bluIncomplete);
      assert.equal(devicesProgress[0].redIncomplete, 1546277128992);
      assert.propertyVal(devicesProgress[0], 'targetId', 'hG9RdwPn1HH4bZLk');
    });
    it('should show the appropriate values after a press_red action', function() {
      const devicesProgress = gameStats.deriveDevicesProgress(fixtures.initialMetadata, fixtures.timelinePressRelease[0])
      assert.isArray(devicesProgress);
      assert.lengthOf(devicesProgress, 1);
      const correctAnswer = [{
        targetId: 'hG9RdwPn1HH4bZLk',
        redIncomplete: 1546277128992,
        bluIncomplete: 0,
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
      assert.isNull(devicesProgress[0].redIncomplete);
      assert.isNull(devicesProgress[0].bluIncomplete);
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
      assert.propertyVal(devProgress, 'targetId', tid);
      assert.deepEqual(devProgress, {
        targetId: tid,
        red: 0,
        blu: 0
      });
    });

    it('should handle a cap_red followed by a cap_unc', function() {
      const tid = 'hG9RdwPn1HH4bZLk';
      const devProgress = gameStats.deriveDevProgress(fixtures.redMetadata, capUncEvt, tid);
      assert.propertyVal(devProgress, 'targetId', tid);
      assert.deepEqual(devProgress, {
        targetId: tid,
        red: 0,
        blu: 0
      });
    });

    it('should ignore release_(red|blu) events without pre-existing (red|blu)Incomplete data', function() {
      const tid = 'hG9RdwPn1HH4bZLk';
      const devProgress = gameStats.deriveDevProgress(fixtures.releasedMetadata, releaseBluEvt, tid);
      assert.propertyVal(devProgress, 'targetId', tid);
      assert.deepEqual(devProgress, {
        redIncomplete: null,
        bluIncomplete: null,
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
    it('should return an Array of devices which have appeard in the timeline and current timeline event step thus far', function() {
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
        redIncomplete,
        bluIncomplete
      } = gameStats.incompleteProgressCompute(fixtures.pressedMetadata, fixtures.timelinePressRelease[1], 'hG9RdwPn1HH4bZLk');
      assert.isNull(redIncomplete);
      assert.isNull(bluIncomplete);
    });
    it('should throw if not receiving 3 params', function() {
      assert.throws(() => {
        gameStats.incompleteProgressCompute();
      });
      assert.throws(() => {
        gameStats.ute(fixtures.initialMetadata, fixtures.timelinePressRelease);
      })
    });
    it('should gracefully handle an empty redIncomplete or bluIncomplete', function() {
      const {
        redIncomplete,
        bluIncomplete
      } = gameStats.incompleteProgressCompute(fixtures.pressedMetadata, fixtures.timelinePressRelease[1], '');

    });
  });


});
