const R = require('ramda');
const moment = require('moment');
const chalk = require('chalk');
const columns = require('cli-columns');


const isOdd = R.modulo(R.__, 2);
const isEven = R.complement(isOdd);
const isRed = R.compose(R.test(/_red$/), R.prop('action'));
const isBlu = R.compose(R.test(/_blu$/), R.prop('action'));


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
    (isRed(thisStepEvent) && old.redIncomplete === null) ||
    (isBlu(thisStepEvent) && old.bluIncomplete === null)
  ) return emptyDelta;


  const lastRedPressTime = moment(R.prop('redIncomplete', old));
  const lastBluPressTime = moment(R.prop('bluIncomplete', old));

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
  //if (isRed(thisStepEvent)) return R.assoc('redIncomplete', 0, pre);
  //if (isBlu(thisStepEvent)) return R.assoc('bluIncomplete', 0, pre);

}

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

const incompleteProgressCompute = (lastStepMetadata, thisStepEvent, deviceId) => {
  if (typeof deviceId === 'undefined') throw new Error('incompleteProgressCompute requires 3 parameters!');
  const devicesProgress = R.prop('devicesProgress', lastStepMetadata);
  const old = R.defaultTo({ redIncomplete: null, bluIncomplete: null }, R.find(R.propEq('targetId', deviceId), devicesProgress));
  const isRedIncomplete = R.propIs(Number, 'redIncomplete', old);
  const isBluIncomplete = R.propIs(Number, 'bluIncomplete', old);
  if (isBlu(thisStepEvent)) return { bluIncomplete: null, redIncomplete: R.prop('redIncomplete', old) || null };
  if (isRed(thisStepEvent)) return { bluIncomplete: R.prop('bluIncomplete', old) || null, redIncomplete: null };
};

const capPercentage = (number) => {
  if (number > 100) number = 100;
  if (number < 0) number = 0;
  return number
}


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
  const isLifeCycleEvent = R.compose(R.test(/start|pause|stop/), R.prop('action'));
  const isStopEvent = R.compose(R.equals('stop'), R.prop('action'));
  const isStartEvent = R.compose(R.equals('start'), R.prop('action'));
  const isPauseEvent = R.compose(R.equals('pause'), R.prop('action'));
  const ca = moment(R.prop('createdAt', thisStepEvent));
  const get = moment(R.prop('gameEndTime', lastStepMetadata));

  const running = { msg: 'running', code: 0 };
  const paused = { msg: 'paused', code: 1 };
  const over = { msg: 'over', code: 2 };
  const stopped = { msg: 'stopped', code: 3 };

  if (get.isSameOrBefore(ca)) return over;
  // if last evt action was stop and this event action is not a lifecycle action, return stopped
  if (
      R.not(isLifeCycleEvent(thisStepEvent))
  ) return lastGameStatus;

  // if game is stopped, do not allow a pause
  if (lastGameStatus.msg === 'stopped' && isPauseEvent(thisStepEvent)) return stopped;

  // if game is over, do not allow a pause
  if (lastGameStatus.msg === 'over' && isPauseEvent(thisStepEvent)) return over;

  // if the game is over, do not allow a start
  if (lastGameStatus.msg === 'over' && isStartEvent(thisStepEvent)) return over;

  if (isStartEvent(thisStepEvent)) return running;
  if (isPauseEvent(thisStepEvent)) return paused;
  if (isStopEvent(thisStepEvent)) return stopped;
};

const deriveRemainingGameTime = (lastStepMetadata, thisStepEvent) => {

  if (typeof thisStepEvent === 'undefined') throw new Error('deriveRemainingGameTime requires two parameters');
  if (typeof thisStepEvent.action === 'undefined') throw new Error('deriveRemainingGameTime did not receive a valid step. action is undefined!');
  if (R.isNil(R.prop('gameStartTime', lastStepMetadata))) throw new Error('deriveRemainingGameTime requires gameStartTime to be not nil.');
  if (R.isNil(R.prop('gameEndTime', lastStepMetadata))) throw new Error('deriveRemainingGameTime requires gameEndTime to be not nil.');
  // rgt = endTime - now

  // paused -> running => rgt = endTime - now
  // paused -> paused => rgt = endTime - now
  // paused -> stopped => rgt = null
  // paused -> over => rgt = 0
  // running -> running => rgt = endTime - now
  // running -> paused => rgt = endTime - now
  // running -> stopped => rgt = null
  // running -> over => rgt = 0
  // stopped -> running => rgt = endTime - now
  // stopped -> paused => rgt = endTime - now
  // stopped -> stopped => rgt = null
  // over -> running => rgt = endTime - now
  // over -> paused => rgt = endTime - now
  // over -> stopped => rgt = null
  // over -> over => rgt = 0

  const thisStepAction = R.prop('action', thisStepEvent);
  const lastStepStatus = R.compose(R.prop('msg'), R.prop('gameStatus'))(lastStepMetadata);
  const ca = R.prop('createdAt', thisStepEvent);
  const mt = R.prop('metadataTimestamp', lastStepMetadata);
  const ged = R.prop('gameElapsedDuration', lastStepMetadata);

  const get = R.prop('gameEndTime', lastStepMetadata);
  const rgt = R.prop('remainingGameTime', lastStepMetadata);
  const gpd = R.prop('gamePausedDuration', lastStepMetadata);
  const gl = R.prop('gameLength', lastStepMetadata);
  const mget = moment(get);
  const mca = moment(ca);
  const mmt = moment(mt);
  const mrgt = moment.duration(rgt);
  const delta = mca.diff(mmt).valueOf();
  const mgpd = moment.duration(gpd);
  const mged = moment.duration(ged);
  const mgl = moment.duration(gl);
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



  if (lastStepStatus === 'paused' && thisStepAction === 'start') return rgt;
  if (lastStepStatus === 'paused' && thisStepAction === 'stop') return null;
  if (lastStepStatus === 'paused' && thisStepAction === 'pause') return rgt;
  if (lastStepStatus === 'paused' && thisStepAction === 'over') return 0;

  if (lastStepStatus === 'running' && thisStepAction === 'start') return cap(rgt-delta);
  if (lastStepStatus === 'running' && thisStepAction === 'stop') return null;
  if (lastStepStatus === 'running' && thisStepAction === 'pause') return cap(rgt-delta);
  if (lastStepStatus === 'running' && thisStepAction === 'over') return 0;

  if (lastStepStatus === 'stopped' && thisStepAction === 'start') return mget.diff(mca).valueOf();
  if (lastStepStatus === 'stopped' && thisStepAction === 'stop') return null;
  if (lastStepStatus === 'stopped' && thisStepAction === 'pause') return rgt;
  if (lastStepStatus === 'stopped' && thisStepAction === 'over') return 0;

  if (lastStepStatus === 'over' && thisStepAction === 'start') return 0;
  if (lastStepStatus === 'over' && thisStepAction === 'stop') return null;
  if (lastStepStatus === 'over' && thisStepAction === 'pause') return 0;
  if (lastStepStatus === 'over' && thisStepAction === 'over') return 0;


  console.error(`something was wrong here--> lastStepStatus:${lastStepStatus}, thisStepAction:${thisStepAction}`)
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

  if (thisStepAction === 'stop') return 0;
  if (lastStepStatus === 'stopped' || lastStepStatus === 'running' || lastStepStatus === 'over') return gpd.valueOf();

  const elapsedTimeSinceLastMetadata = ca.diff(mt);
  if (lastStepStatus === 'paused') return gpd.add(elapsedTimeSinceLastMetadata).valueOf();

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
  const thisStepAction = R.prop('action', thisStepEvent);
  // if the game is stopped, reset the paused duration
  if (thisStepAction === 'stop') return 0;
  const status = lastStepMetadata.gameStatus.msg;
  if (status === 'running' && (thisStepAction !== 'pause' && thisStepAction !== 'stop'))
    return grd.add(elapsed).valueOf();
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
  const gst = moment(lastStepMetadata.gameStartTime);
  const lget = moment(R.ifElse(R.isNil(), R.always(0), R.identity())(lastStepMetadata.gameEndTime));
  const gl = lastStepMetadata.gameLength;
  const gpd = lastStepMetadata.gamePausedDuration;
  const status = lastStepMetadata.gameStatus.msg;
  const ca = moment(thisStepEvent.createdAt);
  const mt = moment(thisStepEvent.metadataTimestamp);
  const elapsed = moment.duration(mt.diff(ca));

  if (lget.valueOf() === 0 || R.isNil(lget.valueOf()))
    return gst.add(gl).add(gpd).valueOf();
  if (status === 'paused')
    return lget.add(elapsed).valueOf();
  return lget.valueOf();
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
  const pointRegex = /(press|release|cap)_(\w{3})/;
  const detailedAction = R.match(pointRegex, action)[1];
  const devicesProgress = lastStepMetadata.devicesProgress;
  const ca = moment(thisStepEvent.createdAt);
  const captureRate = lastStepMetadata.captureRate;
  const lastProgress = R.find(R.propEq('targetId', deviceId), devicesProgress);

  if (detailedAction === 'cap') {
    // admin action
    if (action === 'cap_unc') return { red: 0, blu: 0, targetId: deviceId };
    const origin = lastProgress;
    const delta = {
      red: isRed(thisStepEvent) ? 200 : 0,
      blu: isBlu(thisStepEvent) ? 200 : 0
    };
    const { red, blu } = teamProgressCompute(origin, delta);
    return { red: red, blu: blu, targetId: deviceId };
  }

  if (detailedAction === 'press') {
    // player press button
    const old = lastProgress;
    const neu = {
      redIncomplete: isRed(thisStepEvent) ? ca.valueOf() : 0,
      bluIncomplete: isBlu(thisStepEvent) ? ca.valueOf() : 0,
      red: 0,
      blu: 0,
      targetId: deviceId
    };
    const answer = R.mergeRight(old, neu);
    return answer;
  }

  if (detailedAction === 'release') {
    // player release button
    const original = lastProgress;
    const delta = buttonReleaseDeltaCompute(lastStepMetadata, thisStepEvent, deviceId);
    const { red, blu } = teamProgressCompute(original, delta);
    const { redIncomplete, bluIncomplete } = incompleteProgressCompute(lastStepMetadata, thisStepEvent, deviceId);
    return {
      red: red,
      blu: blu,
      redIncomplete: redIncomplete,
      bluIncomplete: bluIncomplete,
      targetId: deviceId
    }
  }

  // unknown action or a non-device related action
  return lastProgress;
};


const buildInitialMetadata = (gameSettings) => {
  if (typeof gameSettings === 'undefined') throw new Error('buildInitialMetadata requires 1 {Object} gameSettings parameter. got undefined. ')
  const initialMetadata = {
    gameStatus: { msg: 'stopped', code: 3 },
    remainingGameTime: null,
    gameStartTime: null,
    gamePausedDuration: 0,
    gameElapsedDuration: 0,
    gameRunningDuration: 0,
    gameEndTime: null,
    devicesProgress: [],
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
  metadata.gameStartTime = deriveGameStartTime(metadata, evt);
  metadata.gameEndTime = deriveGameEndTime(metadata, evt);
  metadata.remainingGameTime = deriveRemainingGameTime(metadata, evt);
  metadata.gamePausedDuration = deriveGamePausedDuration(metadata, evt);
  metadata.gameRunningDuration = deriveGameRunningDuration(metadata, evt);
  metadata.gameElapsedDuration = deriveGameElapsedDuration(metadata, evt); // depends on gameStartTime, gameEndTime, and gameStatus
  metadata.devicesProgress = deriveDevicesProgress(metadata, evt);
  metadata.gameStatus = deriveGameStatus(metadata, evt); // needs to be after rgt
  metadata.metadataTimestamp = deriveMetadataTimestamp(metadata, evt); // must be last
  metadata.theAnswer = 42;
  // console.log(chalk.cyan.bold('EVALUATRON'))
  //console.log(acc);
  return metadata;
};

/**
 * calculateMetadata
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
    //console.log(`count:${chalk.yellow(count)} tp:${chalk.cyan(tp)} ca:${chalk.blue(R.prop('createdAt', evt))} (tp>ca:${R.gt(tp, R.prop('createdAt', evt))}) action:${chalk.red(R.prop('action', evt))}`);
    return R.gte(tp, R.prop('createdAt', evt))
  };


  const initialMetadata = buildInitialMetadata(gameSettings);

  return R.reduceWhile(isTimepointerAfter, _calculateGameMetadata, initialMetadata, tl);
}


const deriveMetadata = (lastMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveMetadata requires 2 parameters. The second parameter was undefined.')
  if (typeof lastMetadata === 'undefined') throw new Error('thisStepEvent requires 2 parameters. The first parameter was undefined.')

  console.log('lastMetadata vvv')
  console.log(lastMetadata)
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
  },
  pad,
  capPercentage,
  teamProgressCompute,
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
  buttonReleaseDeltaCompute,
  incompleteProgressCompute,
  deriveMetadataTimestamp,
  deriveMetadata,
  buildInitialMetadata,
}
