const R = require('ramda');
const moment = require('moment');
const chalk = require('chalk');
const columns = require('cli-columns');


const isEven = R.compose(R.equals(0), R.modulo(R.__, 2));
const isOdd = R.complement(isEven);
const isRed = R.compose(R.test(/_red$/), R.prop('action'));
const isBlu = R.compose(R.test(/_blu$/), R.prop('action'));
const isLifeCycleEvent = R.compose(R.test(/start|pause|stop/), R.prop('action'));
const isPressEvent = R.compose(R.test(/^(press)_\w{3}$/), R.prop('action'));
const isHoldEvent = R.compose(R.test(/^(hold)_\w{3}$/), R.prop('action'));
const isUnholdEvent = R.compose(R.test(/^(unhold)_\w{3}$/), R.prop('action'));
const isReleaseEvent = R.compose(R.test(/^(release)_\w{3}$/), R.prop('action'));
const isCapEvent = R.compose(R.test(/^(cap)_\w{3}$/), R.prop('action'));
const isProgressEvent = R.compose(R.test(/^(cap|press|release|hold|unhold)_\w{3}$/), R.prop('action'));
const isStopEvent = R.compose(R.equals('stop'), R.prop('action'));
const isStartEvent = R.compose(R.equals('start'), R.prop('action'));
const isPauseEvent = R.compose(R.equals('pause'), R.prop('action'));
const isOverEvent = R.compose(R.equals('over'), R.prop('action'));
const isPausedMetadata = R.compose(R.equals('paused'), R.prop('msg'), R.prop('gameStatus'));
const isRunningMetadata = R.compose(R.equals('running'), R.prop('msg'), R.prop('gameStatus'));
const isOverMetadata = R.compose(R.equals('over'), R.prop('msg'), R.prop('gameStatus'));
const isStoppedMetadata = R.compose(R.equals('stopped'), R.prop('msg'), R.prop('gameStatus'));
const parseMetadata = (metadata) => {
  const rgt = R.prop('remainingGameTime', metadata);
  const gst = R.prop('gameStartTime', metadata);
  const get = R.prop('gameEndTime', metadata);
  const gpd = R.prop('gamePausedDuration', metadata);
  const ged = R.prop('gameElapsedDuration', metadata);
  const grd = R.prop('gameRunningDuration', metadata);
  const mt = R.prop('metadataTimestamp', metadata);
  const gl = R.prop('gameLength', metadata);
  const cr = R.prop('captureRate', metadata);

  const mrgt = moment.duration(rgt);
  const mgst = moment(gst);
  const mget = moment(get);
  const mgpd = moment.duration(get);
  const mged = moment.duration(ged);
  const mgrd = moment.duration(grd);
  const mmt = moment(mt);
  const mgl = moment.duration(gl);
  const mcr = moment.duration(cr);

  return { rgt, gst, get, gpd, ged, grd, mt, gl, cr, mrgt, mgst, mget, mgpd, mged, mgrd, mmt, mgl, mcr };
};


/*
 * GameStats
 * Handles calculation of game timers.
 */


/**
 * timePointer
 *
 * The time pointer tells the library to "go back in time"
 * and determine what the state of the game was at that point in time.
 */
const timePointer = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  return tp;
}



/**
 * buildParameters
 *
 * Validates parameters sent to function.
 * Converts feathers service objects into plain old javascript objects for further processing.
 */
const buildParameters = (findTimelineInStore, findGameInStore, timePointer) => {
  if (typeof findTimelineInStore === 'undefined') throw new Error('first parameter to buildParameters must be defined!')
  if (typeof findGameInStore === 'undefined') throw new Error('second parameter to buildParameters must be defined!')
  if (
    typeof findTimelineInStore === 'string' ||
    typeof findGameInStore === 'string' ||
    typeof timePointer === 'string'
  ) throw new Error('buildParameters received a string as an argument which is not allowed')
  if (typeof timePointer === 'undefined') timePointer = moment().valueOf();

  var tl;
  if (typeof findTimelineInStore === 'function') {
    tl = findTimelineInStore({
      query: {
        $sort: {
          createdAt: 1
        }
      }
    }).data;
  } else {
    tl = R.sortBy(R.prop('createdAt'), findTimelineInStore);
  }

  var game;
  if (typeof findGameInStore === 'function') {
    game = findGameInStore({
      query: {
        $sort: {
          createdAt: 1
        },
        $limit: 1
      }
    }).data[0] || [];
  } else {
    game = findGameInStore;
  }

  game.captureRate = R.defaultTo(5000, game.captureRate);
  game.gameLength = R.defaultTo(50000, game.gameLength);


  const tp = timePointer;

  return {
    tl,
    game,
    tp
  };
};



/**
 * buttonProgressLossDeltaCompute
 *
 * Compute the loss of progress between the last event and now
 */
const buttonProgressLossDeltaCompute = (lastStepMetadata, thisStepEvent, deviceId) => {
  if (typeof lastStepMetadata === 'undefined') throw new Error('first param lastStepMetadata passed to buttonReleaseDeltaCompute is not defined')
  if (typeof deviceId === 'undefined') throw new Error('buttonReleaseDeltaCompute requires 3 params');
  if (typeof lastStepMetadata.captureRate === 'undefined') throw new Error('lastStepMetadata.captureRate passed to buttonReleaseDeltaCompute() is undefined!');
  const captureRate = lastStepMetadata.captureRate;
  const devicesProgress = lastStepMetadata.devicesProgress;
  const ca = moment(thisStepEvent.createdAt);
  const old = R.find(R.propEq('targetId', deviceId), devicesProgress);

  const emptyDelta = { blu: 0, red: 0, targetId: deviceId };
  if (
    (isRed(thisStepEvent) && old.redPressTime === null) ||
    (isBlu(thisStepEvent) && old.bluPressTime === null)
  ) return emptyDelta;

  const lastRedPressTime = moment(R.prop('redPressTime', old));
  const lastBluPressTime = moment(R.prop('bluPressTime', old));

  const _redHeldDuration = moment.duration(ca.diff(lastRedPressTime)).valueOf();
  const _bluHeldDuration = moment.duration(ca.diff(lastBluPressTime)).valueOf();

  const capDuration = R.ifElse(
    R.gt(R.__, R.multiply(captureRate, 2)),
    R.always(R.multiply(captureRate, 2)),
    R.identity()
  );

  const redHeldDuration = isRed(thisStepEvent) ? capDuration(_redHeldDuration) : 0;
  const bluHeldDuration = isBlu(thisStepEvent) ? capDuration(_bluHeldDuration) : 0;

  const redDelta = Math.floor(R.multiply(R.divide(redHeldDuration, captureRate), 100));
  const bluDelta = Math.floor(R.multiply(R.divide(bluHeldDuration, captureRate), 100));

  const delta = {
    red: redDelta * -1,
    blu: bluDelta * -1,
    targetId: deviceId
  }
}

/**
 * buttonReleaseDeltaCompute
 *
 * Compute the progress change between the last button press and now
 */
const buttonReleaseDeltaCompute = (lastStepMetadata, thisStepEvent, deviceId) => {
  if (typeof lastStepMetadata === 'undefined') throw new Error('first param lastStepMetadata passed to buttonReleaseDeltaCompute is not defined')
  if (typeof deviceId === 'undefined') throw new Error('buttonReleaseDeltaCompute requires 3 params');
  if (typeof lastStepMetadata.captureRate === 'undefined') throw new Error('lastStepMetadata.captureRate passed to buttonReleaseDeltaCompute() is undefined!');
  const captureRate = lastStepMetadata.captureRate;
  const devicesProgress = lastStepMetadata.devicesProgress;
  const ca = moment(thisStepEvent.createdAt);
  const old = R.find(R.propEq('targetId', deviceId), devicesProgress);

  const emptyDelta = { blu: 0, red: 0, targetId: deviceId };
  if (
    (isRed(thisStepEvent) && old.redPressTime === null) ||
    (isBlu(thisStepEvent) && old.bluPressTime === null)
  ) return emptyDelta;


  const lastRedPressTime = moment(R.prop('redPressTime', old));
  const lastBluPressTime = moment(R.prop('bluPressTime', old));

  const _redHeldDuration = moment.duration(ca.diff(lastRedPressTime)).valueOf();
  const _bluHeldDuration = moment.duration(ca.diff(lastBluPressTime)).valueOf();

  const capDuration = R.ifElse(
    R.gt(R.__, R.multiply(captureRate, 2)),
    R.always(R.multiply(captureRate, 2)),
    R.identity()
  );

  const redHeldDuration = isRed(thisStepEvent) ? capDuration(_redHeldDuration) : 0;
  const bluHeldDuration = isBlu(thisStepEvent) ? capDuration(_bluHeldDuration) : 0;

  const redProgressSinceLastPress = Math.floor(R.multiply(R.divide(redHeldDuration, captureRate), 100));
  const bluProgressSinceLastPress = Math.floor(R.multiply(R.divide(bluHeldDuration, captureRate), 100));


  const pre = {
    blu: bluProgressSinceLastPress,
    red: redProgressSinceLastPress,
    targetId: deviceId
  };


  return pre;
  // reset the *_incomplete number for the chosen team
  //if (isRed(thisStepEvent)) return R.assoc('redPressTime', 0, pre);
  //if (isBlu(thisStepEvent)) return R.assoc('bluPressTime', 0, pre);

}


/**
 * teamProgressCompute
 *
 * Compute the progress of the devices based on an original progress object and a delta progress object
 */
const teamProgressCompute = (origin, delta) => {
  if (typeof delta === 'undefined') throw new Error('teamProgressCompute requires two parameters!')
  const o = R.ifElse(
    R.either(R.isNil(), R.isEmpty()),
    R.always({red: 0, blu: 0}),
    R.identity()
  )(origin);
  // origin { red: 100, blu: 0 }
  // delta  { red: 0,  blu: 200 }
  // answer { red: 0, blu: 100 }
  // answer = { red: (origin.red-delta.blu), blu: capPercentage(origin.blu + delta.blu) }

  // origin { red: 0,  blu: 100 }
  // delta  { red: 50, blu: 0 } gainingTeam: red
  // answer { red: 0,  blu: 50 }

  // origin { red: 0,  blu: 50 }
  // delta  { red: 50, blu: 0 } gainingTeam: red
  // answer { red: 100,  blu: 0 }

  const gainingAlgo = (color, origin, delta) => {

    if (color === 'red')
      if (origin.blu - delta.red < 0)
        return (origin.red + delta.red - origin.blu);

    if (color === 'blu')
      if (origin.red - delta.blu < 0)
        return (origin.blu + delta.blu - origin.red);

    return 0;
  };

  const losingAlgo = (color, origin, delta) => {
    if (color === 'red') return (origin.red-delta.blu);
    if (color === 'blu') return (origin.blu-delta.red);
    return 0;
  }

  return {
    red: capPercentage(
      (delta.red) ?
      gainingAlgo('red', o, delta) :
      losingAlgo('red', o, delta)
    ),
    blu: capPercentage(
      (delta.blu) ?
      gainingAlgo('blu', o, delta) :
      losingAlgo('blu', o, delta)
    )
  };
}

const teamLossCompute = (origin, delta) => {
  if (typeof delta === 'undefined') throw new Error('teamLossCompute requires two parameters!')
  const o = R.ifElse(
    R.either(R.isNil(), R.isEmpty()),
    R.always({red: 0, blu: 0}),
    R.identity()
  )(origin);

  const gainingAlgo = (color, origin, delta) => {
    if (color === 'red')
      if (origin.blu - delta.red < 0)
        return (origin.red + delta.red - origin.blu);

    if (color === 'blu')
      if (origin.red - delta.blu < 0)
        return (origin.blu + delta.blu - origin.red);

    return 0;
  };

  console.log(`  losing! origin.red:${origin.red}, delta.blu:${delta.blu}, remainder:${origin.red-delta.blu}`)
  console.log(`  losing! origin.blu:${origin.blu}, delta.red:${delta.red}, remainder:${origin.blu-delta.red}`)

  const losingAlgo = (color, origin, delta) => {
    if (color === 'red') return (origin.red-delta.red);
    if (color === 'blu') return (origin.blu-delta.blu);
    return 0;
  }

  return {
    red: capPercentage(
      losingAlgo('red', o, delta)
    ),
    blu: capPercentage(
      losingAlgo('blu', o, delta)
    )
  };
}

const incompleteProgressCompute = (lastStepMetadata, thisStepEvent, deviceId) => {
  if (typeof deviceId === 'undefined') throw new Error('incompleteProgressCompute requires 3 parameters!');
  const devicesProgress = R.prop('devicesProgress', lastStepMetadata);
  const old = R.defaultTo({ redPressTime: null, bluPressTime: null }, R.find(R.propEq('targetId', deviceId), devicesProgress));
  const isredPressTime = R.propIs(Number, 'redPressTime', old);
  const isbluPressTime = R.propIs(Number, 'bluPressTime', old);
  if (isBlu(thisStepEvent)) return { bluPressTime: null, redPressTime: R.prop('redPressTime', old) || null };
  if (isRed(thisStepEvent)) return { bluPressTime: R.prop('bluPressTime', old) || null, redPressTime: null };
};

const capPercentage = (number) => {
  if (number > 100) number = 100;
  if (number < 0) number = 0;
  return number
}


/**
 * deriveDevices
 * Returns an array of devices existing in the game.
 *
 */
const deriveDevices = (lastStepMetadata, thisStepEvent) => {
  const d = R.pluck('targetId', lastStepMetadata.devicesProgress);
  const tid = thisStepEvent.targetId;
  const c = R.reject((itm) => {
    if (R.isNil(itm)) return true;
    if (R.isEmpty(itm)) return true;
    if (R.equals(itm, 'unknown!')) return true;
  }, R.flatten([d, tid]));
  if (R.lt(R.length(c), 1)) return [];
  return R.uniq(c);
};

const deriveGameStatus = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameStatus requires two parameters');
  const lastGameStatus = R.prop('gameStatus', lastStepMetadata);
  const ca = moment(R.prop('createdAt', thisStepEvent));
  const get = moment(R.prop('gameEndTime', lastStepMetadata));
  const rgt = R.prop('remainingGameTime', lastStepMetadata);

  const running = { msg: 'running', code: 0 };
  const paused = { msg: 'paused', code: 1 };
  const over = { msg: 'over', code: 2 };
  const stopped = { msg: 'stopped', code: 3 };

  if (isPausedMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return paused;
  if (isPausedMetadata(lastStepMetadata) && isStartEvent(thisStepEvent)) return running;

  if (R.is(Number, rgt) && rgt < 1) return over;
  // if last evt action was stop and this event action is not a lifecycle action, return stopped
  if (
      R.not(isLifeCycleEvent(thisStepEvent))
  ) return lastGameStatus;

  // if game is stopped, do not allow a pause
  if (isStoppedMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return stopped;

  // if game is over, do not allow a pause
  if (isOverMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return over;

  // if the game is over, do not allow a start
  if (isOverMetadata(lastStepMetadata) && isStartEvent(thisStepEvent)) return over;

  if (isStartEvent(thisStepEvent)) return running;
  if (isStopEvent(thisStepEvent)) return stopped;
  if (isPauseEvent(thisStepEvent)) return paused;
};

const deriveRemainingGameTime = (lastStepMetadata, thisStepEvent) => {

  if (typeof thisStepEvent === 'undefined') throw new Error('deriveRemainingGameTime requires two parameters');
  if (typeof thisStepEvent.action === 'undefined') throw new Error('deriveRemainingGameTime did not receive a valid step. action is undefined!');

  const ca = R.prop('createdAt', thisStepEvent);
  const mt = R.prop('metadataTimestamp', lastStepMetadata);
  const ged = R.prop('gameElapsedDuration', lastStepMetadata);
  const gst = R.prop('gameStartTime', lastStepMetadata);
  const get = R.prop('gameEndTime', lastStepMetadata);
  const rgt = R.prop('remainingGameTime', lastStepMetadata);
  const gpd = R.prop('gamePausedDuration', lastStepMetadata);
  const gl = R.prop('gameLength', lastStepMetadata);
  if (typeof gst === 'undefined' && typeof get === 'undefined') throw new Error('gameStartTime or gameEndTime must be defined when passed to deriveRemainingGameTime. One or both were undefined!');
  if (R.isNil(get)) return null;
  if (R.isNil(gst)) return null;
  const mca = moment(ca);
  const mmt = moment(mt);
  const mrgt = moment.duration(rgt);
  const delta = mca.diff(mmt).valueOf();
  const mgpd = moment.duration(gpd);
  const mged = moment.duration(ged);
  const mgl = moment.duration(gl);
  const mget = moment(get);
  const cap = R.ifElse(R.lt(R.__, 0), R.always(0), R.identity());

  // paused -> running => rgt
  // paused -> stopped => null
  // paused -> paused => rgt
  // paused -> over => 0
  // running -> running => rgt = rgt - delta
  // running -> stopped => null
  // running -> paused => rgt = rgt - delta
  // running -> over => 0
  // stopped -> running => rgt = gst + gameLength
  // stopped -> stopped => null
  // stopped -> paused => null
  // stopped -> over => 0
  // over -> running => null
  // over -> stopped => null
  // over -> paused => null
  // over -> over => 0

  //return cap(get-gst+gpd)

  if (isProgressEvent(thisStepEvent) && !isPausedMetadata(lastStepMetadata)) return cap(rgt-delta);
  if (isProgressEvent(thisStepEvent) && isPausedMetadata(lastStepMetadata)) return rgt;

  if (isPausedMetadata(lastStepMetadata) && isStartEvent(thisStepEvent)) return rgt;
  if (isPausedMetadata(lastStepMetadata) && isStopEvent(thisStepEvent)) return null;
  if (isPausedMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return rgt;
  if (isPausedMetadata(lastStepMetadata) && isOverEvent(thisStepEvent)) return 0;

  if (isRunningMetadata(lastStepMetadata) && isStartEvent(thisStepEvent)) return cap(rgt-delta);
  if (isRunningMetadata(lastStepMetadata) && isStopEvent(thisStepEvent)) return null;
  if (isRunningMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return cap(rgt-delta);
  if (isRunningMetadata(lastStepMetadata) && isOverEvent(thisStepEvent)) return 0;

  if (isStoppedMetadata(lastStepMetadata) && isStartEvent(thisStepEvent)) return mget.diff(mca).valueOf();
  if (isStoppedMetadata(lastStepMetadata) && isStopEvent(thisStepEvent)) return null;
  if (isStoppedMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return rgt;
  if (isStoppedMetadata(lastStepMetadata) && isOverEvent(thisStepEvent)) return 0;

  if (isOverMetadata(lastStepMetadata) && isStartEvent(thisStepEvent)) return 0;
  if (isOverMetadata(lastStepMetadata) && isStopEvent(thisStepEvent)) return null;
  if (isOverMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return 0;
  if (isOverMetadata(lastStepMetadata) && isOverEvent(thisStepEvent)) return 0;

  console.error(`something was wrong here--> lastStepStatus:${lastStepMetadata.gameStatus.msg}, thisStepAction:${thisStepEvent.action}`)
  throw new Error('no valid conditions in deriveRemainingGameTime were satisfied.')
};


const deriveGameStartTime = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameStartTime requires two parameters');
  const lastGameStartTime = R.prop('gameStartTime', lastStepMetadata);
  if (
    R.and(
      R.propEq('action', 'start', thisStepEvent),
      R.isNil(lastGameStartTime)
    )
  ) return R.prop('createdAt', thisStepEvent);
  if (R.isNil(lastGameStartTime)) return null;
  if (R.propEq('action', 'stop', thisStepEvent)) return null;
  return lastGameStartTime;
};

const deriveGamePausedDuration = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGamePausedDuration requires two parameters');
  const gpd = moment.duration(lastStepMetadata.gamePausedDuration);
  const ca = moment(thisStepEvent.createdAt);
  const mt = moment(lastStepMetadata.metadataTimestamp);

  const thisStepAction = R.prop('action', thisStepEvent);
  const lastStepStatus = R.compose(R.prop('msg'), R.prop('gameStatus'))(lastStepMetadata);

  // paused -> running => gpd += elapsedTimeSinceLastMetadata
  // paused -> paused => gpd += elapsedTimeSinceLastMetadata
  // paused -> stopped => gpd = 0;
  // running -> running => gpd = lastStepMetadata.gpd
  // running -> paused => gpd = lastStepMetadata.gpd
  // running -> stopped => gpd = 0;
  // stopped -> running => gpd = lastStepMetadata.gpd;
  // stopped -> paused => gpd = lastStepMetadata.gpd;
  // stopped -> stopped => gpd = lastStepMetadata.gpd;
  // over -> running => (not possible)
  // over -> paused => (not possible)
  // over -> stopped => gpd = 0;

  const elapsedTimeSinceLastMetadata = ca.diff(mt);

  if (isStoppedMetadata(lastStepMetadata) || isStopEvent(thisStepEvent)) return 0;
  if (isRunningMetadata(lastStepMetadata) && isStartEvent(thisStepEvent))
    return gpd.valueOf();
  if (isPausedMetadata(lastStepMetadata)) return gpd.add(elapsedTimeSinceLastMetadata).valueOf();
  if (isProgressEvent(thisStepEvent) && isRunningMetadata(lastStepMetadata)) return gpd.valueOf();
  if (isStopEvent(thisStepEvent)) return 0;
  if (isOverMetadata(lastStepMetadata)) return gpd.valueOf();
  if (isRunningMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent)) return gpd.valueOf();

  throw new Error(`deriveGamePausedDuration ended up with lastStepStatus:${lastStepStatus}, thisStepAction:${thisStepAction} which is unsupported`);
};


/**
 * deriveGameElapsedDuration
 *
 * gameElapsedDuration is gameRunningDuration+gamePausedDuration.
 *
 */
const deriveGameElapsedDuration = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameElapsedDuration requires two parameters');
  const ged = moment.duration(lastStepMetadata.gameElapsedDuration);
  const mt = moment(lastStepMetadata.metadataTimestamp); // ccc
  const ca = moment(thisStepEvent.createdAt);
  const status = lastStepMetadata.gameStatus.msg;
  const gst = R.ifElse(
    R.isNil(),
    R.always(0),
    R.identity()
  )(R.prop('gameStartTime', lastStepMetadata));
  const thisStepAction = R.prop('action', thisStepEvent);
  // if the game is stopped, reset the elapsed duration
  if (thisStepAction === 'stop') return 0;
  const delta = moment.duration(ca.diff(mt));
  if (status === 'running' || status === 'paused') return ged.clone().add(delta).valueOf();
  return ged.valueOf();
};

const deriveGameRunningDuration = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameRunningDuration requires two parameters');
  const grd = moment.duration(lastStepMetadata.gameRunningDuration);
  const mt = moment(lastStepMetadata.metadataTimestamp);
  const ca = moment(thisStepEvent.createdAt);
  const elapsed = moment.duration(ca.diff(mt));
  // if the game is stopped, reset the running duration
  if (isStopEvent(thisStepEvent)) return 0;

  // if the game is being paused, return the elapsed time until now
  if (isRunningMetadata(lastStepMetadata) && isPauseEvent(thisStepEvent))
    return grd.clone().add(elapsed).valueOf();

  // if the game is running, increment
  if (isRunningMetadata(lastStepMetadata))
    return grd.clone().add(elapsed).valueOf();

  // all other cases, return the last value
  return grd.valueOf();
};


/**
 * deriveGameEndTime
 *
 * return the game end time based on the received metadata.
 *
 * Absolutely, the game end time can be calculated as follows.
 *   gameEndTime = gameStartTime + gameLength + gamePausedDuration
 *
 * However, a delta calculation is preferred such as--
 *   gameEndTime = metadata.gameEndTime + [time since last metadata]
 *
 */
const deriveGameEndTime = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameEndTime requires two parameters');
  if (R.isNil(R.prop('gameStartTime', lastStepMetadata))) return null;
  const mca = moment(thisStepEvent.createdAt);

  const { mgst, mget, mgl, mgpd, mmt, get } = parseMetadata(lastStepMetadata);
  const elapsed = moment.duration(mmt.diff(mca));

  if (mget.valueOf() === 0 || R.isNil(get))
    return mgst.add(mgl).add(mgpd).valueOf();
  if (isPausedMetadata(lastStepMetadata))
    return mget.add(elapsed).valueOf();
  return mget.valueOf();
};



const deriveDevicesProgress = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveDevicesProgress requires two parameters');
  const ca = moment(thisStepEvent.createdAt);
  const status = lastStepMetadata.gameStatus.msg;
  const action = thisStepEvent.action;

  const targetId = thisStepEvent.targetId;
  const captureRate = lastStepMetadata.captureRate;
  const devices = deriveDevices(lastStepMetadata, thisStepEvent);

  if (devices.length < 1) return [];
  return R.map((id) => {
    // if (id !== targetId) return
    return deriveDevProgress(lastStepMetadata, thisStepEvent, id);
  }, devices);
};

const deriveMetadataTimestamp = (lastStepMetadata, thisStepEvent) => {
  const mt = thisStepEvent.createdAt;
  return mt;
};


const deriveDevProgress = (lastStepMetadata, thisStepEvent, deviceId) => {
  if (typeof deviceId === 'undefined') throw new Error('deriveDevProgress requires three parameters');
  const action = thisStepEvent.action;
  // const pointRegex = /(press|release|cap|hold|unhold)_(\w{3})/;
  // const detailedActionActual = R.match(pointRegex, action);
  // const detailedAction = detailedActionActual[1];
  const devicesProgress = R.prop('devicesProgress', lastStepMetadata);
  const ca = moment(thisStepEvent.createdAt);
  const captureRate = lastStepMetadata.captureRate;
  const defaultProgress = { red: 0, blu: 0, bluPressTime: null, redPressTime: null, targetId: deviceId };
  const lastProgress = R.find(R.propEq('targetId', deviceId), devicesProgress);
  // I use "this" not in the sense that it's the progress computed for this step, but the
  // progress that is in lastStepMetadata that belongs to *this* deviceId
  const thisProgress = R.ifElse(
    R.isNil(),
    R.always(defaultProgress),
    R.identity()
  )(lastProgress);

  // if the event action does not reference this device Id, return last metadata's progress
  if (thisStepEvent.targetId !== deviceId) return thisProgress;


  if (isCapEvent(thisStepEvent)) {
    // admin action
    if (action === 'cap_unc') return { red: 0, blu: 0, targetId: deviceId };
    const origin = thisProgress;
    const delta = {
      red: isRed(thisStepEvent) ? 200 : 0,
      blu: isBlu(thisStepEvent) ? 200 : 0
    };
    const { red, blu } = teamProgressCompute(origin, delta);
    return { red: red, blu: blu, targetId: deviceId };
  }

  if (isPressEvent(thisStepEvent)) {
    // player press button
    const old = thisProgress;
    const neu = {
      redPressTime: isRed(thisStepEvent) ? ca.valueOf() : null,
      bluPressTime: isBlu(thisStepEvent) ? ca.valueOf() : null,
      red: old.red,
      blu: old.blu,
      targetId: deviceId
    };
    return neu;
  }

  if (isReleaseEvent(thisStepEvent)) {
    // player release button
    const original = thisProgress;
    const delta = buttonReleaseDeltaCompute(lastStepMetadata, thisStepEvent, deviceId);
    const { red, blu } = teamProgressCompute(original, delta);
    const { redPressTime, bluPressTime } = incompleteProgressCompute(lastStepMetadata, thisStepEvent, deviceId);
    return {
      red: red,
      blu: blu,
      redPressTime: redPressTime,
      bluPressTime: bluPressTime,
      targetId: deviceId
    }
  }

  if (isHoldEvent(thisStepEvent)) {
    // server initiated hold action.
    const original = thisProgress;
    const delta = buttonReleaseDeltaCompute(lastStepMetadata, thisStepEvent, deviceId);
    const { red, blu } = teamProgressCompute(original, delta);
    const devicesProgress = R.prop('devicesProgress', lastStepMetadata);
    // const { redPressTime, bluPressTime } = incompleteProgressCompute(lastStepMetadata, thisStepEvent, deviceId);
    const lastRedPressTime = R.find(R.propEq('targetId', deviceId), devicesProgress).redPressTime;
    const lastBluPressTime = R.find(R.propEq('targetId', deviceId), devicesProgress).bluPressTime;
    return {
      red: red,
      blu: blu,
      redPressTime: isRed(thisStepEvent) ? thisStepEvent.createdAt : null,
      bluPressTime: isBlu(thisStepEvent) ? thisStepEvent.createdAt : null,
      targetId: deviceId
    }
  }

  if (isUnholdEvent(thisStepEvent)) {
    // the button is no longer held (but was previously)
    // our goal here is to reduce the device progress until it gets to 0.
    const original = thisProgress;
    const delta = buttonReleaseDeltaCompute(lastStepMetadata, thisStepEvent, deviceId);
    const { red, blu } = teamLossCompute(original, delta);
    const devicesProgress = R.prop('devicesProgress', lastStepMetadata);
    const { redPressTime, bluPressTime } = incompleteProgressCompute(lastStepMetadata, thisStepEvent, deviceId);
    const lastRedPressTime = R.find(R.propEq('targetId', deviceId), devicesProgress).redPressTime;
    const lastBluPressTime = R.find(R.propEq('targetId', deviceId), devicesProgress).bluPressTime;
    console.log(`  lastRedPressTime:${lastRedPressTime}, lastBluPressTime:${lastBluPressTime} red:${red}, blu:${blu}`);
    return {
      red: red,
      blu: blu,
      redPressTime: isRed(thisStepEvent) ? thisStepEvent.createdAt : null,
      bluPressTime: isBlu(thisStepEvent) ? thisStepEvent.createdAt : null,
      targetId: deviceId
    }
  }

  // unknown action or a non-device related action
  console.log(`  💂🏼 Problum. action:${action} is not supported.`);
  return thisProgress;
};

const deriveScore = (metadata, evt) => {
  const { mgst, mget, mgl, mgpd, mmt, get } = parseMetadata(metadata);
  const mca = moment(evt.createdAt);
  const elapsedTimeSinceLastMetadata = moment.duration(mca.diff(mmt));
  const devicesProgress = metadata.devicesProgress;
  const lastMetadataTimestamp = metadata.metadataTimestamp;
  const lastMetadataScore = metadata.score;
  const lastBluScore = lastMetadataScore.blu;
  const lastRedScore = lastMetadataScore.red;

  // if devicesProgress.red is at 100
  //   score.redTotalControlledTime = metadata.metadataTimestamp + elapsedTimeSinceLastMetadata

  // score.red = (score.redTotalControlledTime / 60000) * 100  // 100 pts per min
  // score.blu = (score.bluTotalControlledTime / 60000) * 100

  const calculateDeviceScore = (deviceProgress) => {
    const targetId = deviceProgress.targetId;
    const defaultDeviceScore = { red: 0, blu: 0, redTotalControlledTime: 0, bluTotalControlledTime: 0, targetId: targetId };
    const lastDeviceScore = R.find(R.propEq('targetId', targetId))(metadata.score.devicesScores);
    const basisDevScore = (typeof lastDeviceScore === 'undefined') ? defaultDeviceScore : lastDeviceScore;
    const redTotalControlledTime =
      (deviceProgress.red === 100)
      ? moment.duration(basisDevScore.redTotalControlledTime).clone().add(elapsedTimeSinceLastMetadata).valueOf()
      : basisDevScore.redTotalControlledTime;
    const bluTotalControlledTime =
      (deviceProgress.blu === 100)
      ? moment.duration(basisDevScore.bluTotalControlledTime).clone().add(elapsedTimeSinceLastMetadata).valueOf()
      : basisDevScore.bluTotalControlledTime;
    return {
      "bluTotalControlledTime": bluTotalControlledTime,
      "redTotalControlledTime": redTotalControlledTime,
      "red": Math.floor(redTotalControlledTime / 60000) * 100,
      "blu": Math.floor(bluTotalControlledTime / 60000) * 100,
      "targetId": targetId
    };
  };

  const resetDeviceScore = (deviceProgress) => {
    return {
      "red": 0,
      "blu": 0,
      "targetId": deviceProgress.targetId,
      "redTotalControlledTime": 0,
      "bluTotalControlledTime": 0
    };
  };

  if (isRunningMetadata(metadata)) {
    devicesScores = R.map(calculateDeviceScore, devicesProgress);
    redScore = R.reduce((acc, d) => d.red + acc, 0, devicesScores);
    bluScore = R.reduce((acc, d) => d.blu + acc, 0, devicesScores);
  } else if (isStopEvent(evt)) {
    devicesScores = R.map(resetDeviceScore, devicesProgress);
    redScore = R.reduce();
    bluScore = R.reduce();
  } else {
    devicesScores = metadata.score.devicesScores;
    redScore = lastRedScore;
    bluScore = lastBluScore;
  }

  return {
    "devicesScores": devicesScores,
    "red": redScore,
    "blu": bluScore
  }
}

const buildInitialDevicesProgress = (includedDevices) => {
  const build = (iDev) => {
    return {
      targetId: iDev,
      red: 0,
      blu: 0
    }
  };
  return R.map(build, includedDevices);
}


const buildInitialMetadata = (gameSettings) => {
  if (typeof gameSettings === 'undefined') throw new Error('  ❎ buildInitialMetadata requires first param {Object} gameSettings. got undefined. ')
  const initialMetadata = {
    score: {
      devicesScores: [],
      red: 0,
      blu: 0,
      redTotalControlledTime: 0,
      bluTotalControlledTime: 0
    },
    gameStatus: { msg: 'stopped', code: 3 },
    remainingGameTime: null,
    gameStartTime: null,
    gamePausedDuration: 0,
    gameElapsedDuration: 0,
    gameRunningDuration: 0,
    gameEndTime: null,
    devicesProgress: buildInitialDevicesProgress(gameSettings.includedDevices),
    metadataTimestamp: null,
    gameLength: gameSettings.gameLength,
    captureRate: gameSettings.captureRate
  };
  return initialMetadata;
};



const _calculateGameMetadata = (lastMetadata, evt) => {
  // Sequentially turn events into metadata
  // ORDER MATTERS! Put dependencies first.
  var metadata = R.clone(lastMetadata);
  metadata.theAnswer = 42;
  metadata.gameStartTime = deriveGameStartTime(metadata, evt);
  metadata.gameEndTime = deriveGameEndTime(metadata, evt);
  metadata.remainingGameTime = deriveRemainingGameTime(metadata, evt);
  metadata.devicesProgress = deriveDevicesProgress(metadata, evt);
  metadata.gamePausedDuration = deriveGamePausedDuration(metadata, evt); // depends on gameStatus, mt, ca, gpd
  metadata.gameRunningDuration = deriveGameRunningDuration(metadata, evt); // depends on gameStatus, mt, ca, grd
  metadata.gameElapsedDuration = deriveGameElapsedDuration(metadata, evt); // depends on gameStartTime, gameEndTime, and gameStatus
  metadata.score = deriveScore(metadata, evt);
  metadata.gameStatus = deriveGameStatus(metadata, evt); // needs to be after deriveGame*Duration and deriveRemainingGameTime functions
  metadata.metadataTimestamp = deriveMetadataTimestamp(metadata, evt); // must be last
  return metadata;
};

/**
 * calculateMetadata
 *
 * **DEPRECATED**. Does not take includedDevices into account when calling buildInitialMetadata
 *
 * Calculates the state of the entire game based on the timeline, gameSettings, and timePointer it is given.
 */
const calculateMetadata = (timeline, gameSettings, timePointer) => {
  const { tl, game, tp } = buildParameters(timeline, gameSettings, timePointer);

  // things we compute as we go along
  // * gameStatus (started, stopped, paused, over)
  // * remainingGameTime
  // * gameStartTime
  // * gamePausedDuration
  // * gameElapsedDuration
  // * gameRunningDuration
  // * gameEndTime
  // * pressProgress
  // * devicesProgress

  var count = 0;
  const isTimepointerAfter = (acc, evt) => {
    count ++;
    return R.gte(tp, R.prop('createdAt', evt))
  };


  const initialMetadata = buildInitialMetadata(gameSettings, []);

  return R.reduceWhile(isTimepointerAfter, _calculateGameMetadata, initialMetadata, tl);
}


const deriveMetadata = (lastMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveMetadata requires 2 parameters. The second parameter was undefined.');
  if (typeof lastMetadata === 'undefined') throw new Error('thisStepEvent requires 2 parameters. The first parameter was undefined.');
  if (typeof lastMetadata.gameStatus === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gameStatus is undefined');
  if (typeof lastMetadata.remainingGameTime === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. remainingGameTime is undefined');
  if (typeof lastMetadata.gameStartTime === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gameStartTime is undefined');
  if (typeof lastMetadata.gamePausedDuration === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gamePausedDuration is undefined');
  if (typeof lastMetadata.gameElapsedDuration === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gameElapsedDuration is undefined');
  if (typeof lastMetadata.gameRunningDuration === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gameRunningDuration is undefined');
  if (typeof lastMetadata.gameEndTime === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gameEndTime is undefined');
  if (typeof lastMetadata.devicesProgress === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. devicesProgress is undefined');
  if (typeof lastMetadata.metadataTimestamp === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. metadataTimestamp is undefined');
  if (typeof lastMetadata.gameLength === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. gameLength is undefined');
  if (typeof lastMetadata.captureRate === 'undefined') throw new Error('deriveMetadata did not receive valid metadata. captureRate is undefined');

  return _calculateGameMetadata(lastMetadata, thisStepEvent);
};


/**
 * calculateDevicesProgress
 *
 * Return the team progress percentages at any point in time
 *
 * @param {Array} pressData - Array of (press|release)_\w+ events
 * @param {Number} timePointer - milliseconds since Epoch timestamp of the point in time for which we want to see progress percentages
 *                               @TODO
 * @return {Array} progresses
 */

const pad = (amt, txt) => {
  if (typeof amt === 'undefined') throw new Error('pad requires >=1 parameter');
  const doPad = (acc, char) => {
    return R.concat(acc, ' ');
  };
  if (typeof txt === 'undefined') {
    txt = amt;
    amt = 8;
  };
  txt = txt.toString();
  const txtLength = R.length(txt);
  if (txtLength < amt) {
    const addThisMany = (amt-txtLength);
    const finalTxt = R.reduce(doPad, txt, R.times(R.identity, addThisMany));
    return finalTxt;
  }
  return txt;
};



module.exports = {
  install(Vue, opts) {
    Vue.prototype.$gameStats = {};
    Vue.prototype.$gameStats.capPercentage = capPercentage;
    Vue.prototype.$gameStats.pad = pad;
    Vue.prototype.$gameStats.teamProgressCompute = teamProgressCompute;
    Vue.prototype.$gameStats.teamLossCompute = teamLossCompute;
    Vue.prototype.$gameStats.calculateMetadata = calculateMetadata;
    Vue.prototype.$gameStats.deriveGameStatus = deriveGameStatus;
    Vue.prototype.$gameStats.deriveRemainingGameTime = deriveRemainingGameTime;
    Vue.prototype.$gameStats.deriveGameStartTime = deriveGameStartTime;
    Vue.prototype.$gameStats.deriveGamePausedDuration = deriveGamePausedDuration;
    Vue.prototype.$gameStats.deriveGameElapsedDuration = deriveGameElapsedDuration;
    Vue.prototype.$gameStats.deriveGameRunningDuration = deriveGameRunningDuration;
    Vue.prototype.$gameStats.deriveGameEndTime = deriveGameEndTime;
    Vue.prototype.$gameStats.deriveDevicesProgress = deriveDevicesProgress;
    Vue.prototype.$gameStats.deriveDevProgress = deriveDevProgress;
    Vue.prototype.$gameStats.deriveDevices = deriveDevices;
    Vue.prototype.$gameStats.buttonReleaseDeltaCompute = buttonReleaseDeltaCompute;
    Vue.prototype.$gameStats.incompleteProgressCompute = incompleteProgressCompute;
    Vue.prototype.$gameStats.deriveMetadataTimestamp = deriveMetadataTimestamp;
    Vue.prototype.$gameStats.deriveMetadata = deriveMetadata;
    Vue.prototype.$gameStats.buildInitialMetadata = buildInitialMetadata;
    Vue.prototype.$gameStats.isOdd = isOdd;
    Vue.prototype.$gameStats.isEven = isEven;
    Vue.prototype.$gameStats.isRed = isRed;
    Vue.prototype.$gameStats.isBlu = isBlu;
    Vue.prototype.$gameStats.isLifeCycleEvent = isLifeCycleEvent;
    Vue.prototype.$gameStats.isProgressEvent = isProgressEvent;
    Vue.prototype.$gameStats.isStopEvent = isStopEvent;
    Vue.prototype.$gameStats.isStartEvent = isStartEvent;
    Vue.prototype.$gameStats.isPauseEvent = isPauseEvent;
    Vue.prototype.$gameStats.isCapEvent = isCapEvent;
    Vue.prototype.$gameStats.isOverEvent = isOverEvent;
    Vue.prototype.$gameStats.isPressEvent = isPressEvent;
    Vue.prototype.$gameStats.isHoldEvent = isHoldEvent;
    Vue.prototype.$gameStats.isUnholdEvent = isUnholdEvent;
    Vue.prototype.$gameStats.isReleaseEvent = isReleaseEvent;
    Vue.prototype.$gameStats.isPausedMetadata = isPausedMetadata;
    Vue.prototype.$gameStats.isRunningMetadata = isRunningMetadata;
    Vue.prototype.$gameStats.isOverMetadata = isOverMetadata;
    Vue.prototype.$gameStats.isStoppedMetadata = isStoppedMetadata;
    Vue.prototype.$gameStats.parseMetadata = parseMetadata;
    Vue.prototype.$gameStats.deriveScore = deriveScore;
  },
  pad,
  capPercentage,
  teamProgressCompute,
  teamLossCompute,
  calculateMetadata,
  deriveGameStatus,
  deriveRemainingGameTime,
  deriveGameStartTime,
  deriveGamePausedDuration,
  deriveGameElapsedDuration,
  deriveGameRunningDuration,
  deriveGameEndTime,
  deriveDevicesProgress,
  deriveDevProgress,
  deriveDevices,
  deriveScore,
  buttonReleaseDeltaCompute,
  incompleteProgressCompute,
  deriveMetadataTimestamp,
  deriveMetadata,
  buildInitialMetadata,
  isOdd,
  isEven,
  isRed,
  isBlu,
  isLifeCycleEvent,
  isPressEvent,
  isReleaseEvent,
  isHoldEvent,
  isUnholdEvent,
  isCapEvent,
  isProgressEvent,
  isStopEvent,
  isStartEvent,
  isPauseEvent,
  isOverEvent,
  isPausedMetadata,
  isRunningMetadata,
  isOverMetadata,
  isStoppedMetadata,
  parseMetadata,
}
