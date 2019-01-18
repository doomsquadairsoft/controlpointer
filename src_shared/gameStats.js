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

const buildPressParameters = (pressData, timePointer) => {
  const tp = R.ifElse(
    R.isNil(),
    R.always(moment().valueOf()),
    R.always(timePointer)
  )(timePointer);

  const pd = R.ifElse(
    R.isNil(),
    () => { throw new Error('pressData is undefined!') },
    R.always(pressData)
  )(pressData);

  return { pd, tp };
}

const gameLength = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    game
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const gl = game.gameLength;
  if (typeof game.gameLength === 'undefined') return 50000; //throw new Error('gameLength was not defined in game settings object!')
  return gl;
}

const gameStartTime = (findTimelineInStore, findGameInStore, timePointer) => {
  //const { rawtl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const tl = activeTimeline(findTimelineInStore, findGameInStore, timePointer);
  const startEvent = R.find(
    R.propEq('action', 'start'),
    tl
  )
  const startTime = R.prop('createdAt', startEvent);
  return startTime;
}

/**
 * gameEndTime()
 * Returns the computed end time based on start time,
 * accrued paused time, and specified game duration.
 * @returns {Number} gameEndTime - the ms timestamp when the game will be
 *                                 considered ended.
 */
const gameEndTime = (findTimelineInStore, findGameInStore, timePointer) => {
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  if (activeTimeline(tl, game, tp).length < 1) return moment(0).valueOf();
  const gst = moment(gameStartTime(tl, game, tp));
  const gpd = moment.duration(gamePausedDuration(tl, game, tp));
  const gl = moment.duration(gameLength(tl, game, tp));
  const ged = moment.duration(gameElapsedDuration(tl, game, tp));
  const get = gst.clone().add(gl).add(gpd).valueOf();
  return get;
}

const gameEndTimeHumanized = (findTimelineInStore, findGameInStore, timePointer) => {
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const get = gameEndTime(tl, game, tp);
  const geth = moment(get).format("dddd, MMMM Do YYYY, h:mm:ss a");
  return geth;
}


const gameStatus = (findTimelineInStore, findGameInStore, timePointer) => {
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const lctl = lifecycleTimeline(tl, game, tp);
  const mostRecentLifecycleEvent = R.last(lctl);
  const get = moment(gameEndTime(tl, game, tp));
  const gl = moment.duration(gameLength(tl, game, tp));
  const now = moment(tp);

  if (lctl.length == 0) return {
    code: 2,
    msg: 'stopped'
  };
  if (now.isAfter(get)) return {
    code: 3,
    msg: 'over'
  };
  if (mostRecentLifecycleEvent.action === 'start') return {
    code: 0,
    msg: 'running'
  };
  if (mostRecentLifecycleEvent.action === 'pause') return {
    code: 1,
    msg: 'paused'
  };
}

const activeTimelineVs = (findTimelineInStore, findGameInStore, timePointer) => {
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const at = activeTimeline(tl, game, tp);
  const get = gameEndTime(tl, game, tp);
  const adaptToVs = (datum) => {
    // if it's from admin source, add to vs group Admin
    var vs = {};
    if (datum.source === 'admin') {
      vs.at = moment(datum.createdAt).toDate();
      vs.symbol = 'symbolDiamond';

    } else {
      // not admin
      // not possible yet
      // @TODO implement virtual control point so we can fill this out
      vs.symbol = 'symbolCircle';
    }

    // set color
    if (datum.action === 'start') {
      vs.className = 'grnBar';
    } else if (datum.action === 'cap_blu') {
      vs.className = 'bluBar'
    } else if (datum.action === 'cap_red') {
      vs.className = 'redBar'
    } else if (datum.action === 'cap_unc') {
      vs.className = 'gryBar'
    } else {
      vs.className = 'ylwBar';
    }

    // set the title
    vs.title = `${datum.source} ${datum.action} ${datum.target}`;

    // set group
    vs.group = R.toUpper(datum.target);

    return vs;
  };

  const vsTimelineData = R.map(adaptToVs, at);

  // add a point for the end of the game
  vsTimelineData.push({
    at: moment(get).toDate(),
    className: 'redBar',
    symbol: 'symbolSquare',
    title: 'End of Game',
    group: 'GAME'
  })

  return vsTimelineData;
}

const activeTimeline = (findTimelineInStore, findGameInStore, timePointer) => {
  // activeTimeline is an array of cleansed timeline events
  // following the latest stop event up until the timePointer
  // if there is no stop event, it is the entire cleansed timeline.
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);

  const ct = cleansedTimeline(tl, game, tp);
  if (ct.length < 1) return [];

  const lastStopEventIndex = R.findLastIndex(
    R.propEq('action', 'stop')
  )(ct);


  const allEventsAfterLastStopEvent = R.slice(
    R.add(lastStopEventIndex, 1),
    R.length(ct),
    ct
  );

  const allEventsOrSome = R.ifElse(
    R.equals(-1),
    R.always(ct),
    R.always(allEventsAfterLastStopEvent)
  );

  const relevantTimeline = allEventsOrSome(lastStopEventIndex);

  const isEventBeforePointer = (evt) => {
    return R.lte(
      R.prop('createdAt', evt),
      tp
    );
  }

  const at = R.filter(isEventBeforePointer, relevantTimeline);

  return at;
}



// cleansedTimeline is the timeline without duplicate events
const cleansedTimeline = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);

  const sortByTimestamp = R.sortBy(R.prop('createdAt'));
  const sortedTimeline = sortByTimestamp(tl);

  return deDup(sortedTimeline);
};


const deDup = (arr) => {
  const filterIndexed = R.addIndex(R.filter);
  const isItemValid = (evt, idx, col) => {
    if (idx == col.length - 1) return true;
    if (
      R.equals(
        R.prop('action', evt),
        R.prop('action', col[idx + 1])
      )
    ) {
      return false
    } else {
      return true;
    }
  };
  const backwardsArr = R.reverse(arr);
  const backwardsDedupedArr = filterIndexed(
    isItemValid,
    backwardsArr
  );
  const deDupedArr = R.reverse(backwardsDedupedArr)
  return deDupedArr;
};

const lifecycleTimeline = (findTimelineInStore, findGameInStore, timePointer) => {
  const tl = activeTimeline(findTimelineInStore, findGameInStore, timePointer);
  const isLifeCycleEvent = (evt) => (evt.action === 'start' || evt.action === 'pause') ? true : false;
  const lifecycleTimeline = R.filter(isLifeCycleEvent, tl);
  return lifecycleTimeline;
}


// /**
//  * timelineAfterDate
//  * @param {String} date - date in milliseconds
//  * @returns {Promise}
//  */
// const timelineAfterDate = (date) {
//   date = parseInt(date);
//   const afterDate = item => R.gt(R.prop('createdAt', item), date);
//   return R.sortBy(
//     R.prop('createdAt'), this.timeline
//   ).filter(
//     afterDate
//   );
// }

const gt = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const rando = Math.floor(Math.random() * 100) + 1;
  const isEven = (n) => (n % 2 == 0);
  const datum1 = isEven(rando) ? 'scenario 1' : 'WE GOT A #2, SOYBOIz!'
  const datum2 = R.prop('action', R.last(tl)) || 'idk';
  const datum3 = R.prop('gameLength', R.last(game)) || 'fukifiknow';
  const datum4 = isEven(rando);
  return {
    'a': datum1,
    'b': datum2,
    'c': datum3,
    'd': datum4
  };
}

const gamePausedDuration = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const indexedMap = R.addIndex(R.map);
  const lctl = lifecycleTimeline(tl, game, tp);

  const algo = (evt, idx, col) => {

    if (idx % 2 === 0) return 0; // only process odd events (pauses)

    const thisTimestamp = moment(evt.createdAt);
    const resumeTimestamp = ((idx, col) => {
      if ((idx + 1) === col.length) {
        return moment(tp);
      } else return moment(col[idx + 1].createdAt);
    })(idx, col);

    const msDelta = moment.duration(
      resumeTimestamp.diff(thisTimestamp)
    );

    return msDelta.valueOf();
  }

  const pausedDurations = indexedMap(algo, lctl);
  const duration = R.reduce(R.add, 0, pausedDurations);
  return duration;
}


/**
 * gameElapsedDuration
 * @returns {Number} gameElapsedDuration - total number of ms in which
 *                                         the game has been running AND paused
 */
const gameElapsedDuration = (findTimelineInStore, findGameInStore, timePointer) => {
  const gst = moment(gameStartTime(findTimelineInStore, findGameInStore, timePointer));
  const now = moment(timePointer);
  return moment.duration(now.clone().diff(gst)).valueOf();
}

/**
 * @returns {Number} gameRunningDuration - the total number of ms that the game has been RUNNING for (not paused)
 */
const gameRunningDuration = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const gst = moment(gameStartTime(tl, game, tp));
  const gpd = moment.duration(gamePausedDuration(tl, game, tp));
  const now = moment(tp);
  // ((now - startTime) - pausedDuration)
  const grd = moment.duration(now.diff(gst)).subtract(gpd).valueOf();
  return grd;
}



const mostRecentStop = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const sort = R.sortBy(
    R.prop('createdAt'), tl
  );
  const last = R.findLast(
    R.propEq('action', 'stop'), sort
  );
  return R.prop('createdAt', last);
}

const remainingGameTime = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  // rgt = endTime - now
  const endTime = moment(gameEndTime(tl, game, tp));
  const now = moment(tp);
  const rgt = endTime.diff(now);
  return rgt;
}

const remainingGameTimeDigital = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const rgt = moment.duration(remainingGameTime(tl, game, tp));
  const endTime = moment(gameEndTime(tl, game, tp));

  if (moment(tp).isAfter(endTime)) return '00:00:00'

  const h = rgt.hours();
  const m = rgt.minutes();
  const s = rgt.seconds();
  const _hh = h < 10 ? '0' + h : h;
  const _mm = m < 10 ? '0' + m : m;
  const _ss = s < 10 ? '0' + s : s;
  const hh = _hh === 0 ? '00' : _hh;
  const mm = _mm === 0 ? '00' : _mm;
  const ss = _ss === 0 ? '00' : _ss;

  return `${hh}:${mm}:${ss}`;
}

const remainingGameTimeHumanized = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const rgt = moment.duration(remainingGameTime(tl, game, tp));
  return rgt.humanize();
}



/**
 * cleansedPressData
 *
 * Gets the press_blu release_blu events without neighboring duplicate events
 *
 * @param {Array} pressData - Array of (press|release)_\w+ events
 * @param {Number} timePointer - the ms epoch timestamp of the point in time we are calculating for
 * @return {Array} - pressData without duplicates
 */
const cleansedPressData = (pressData, gameSettings, timePointer) => {
  const { tl, tp } = buildParameters(pressData, gameSettings, timePointer);
  const isPropBeforeTp = R.compose(R.gte(tp), R.prop('createdAt'));
  const sortByTimestamp = R.sortBy(R.prop('createdAt'));
  const timeFilteredData = R.filter(isPropBeforeTp, tl);
  const sortedPressData = sortByTimestamp(timeFilteredData);
  const lastStopEventIndex = R.findLastIndex(R.propEq('action', 'stop'), sortedPressData);
  const slicedData = R.slice(lastStopEventIndex, R.length(sortedPressData), sortedPressData);
  const activePressData = R.ifElse(
    R.equals(-1),
    R.always(sortedPressData),
    R.always(slicedData)
  )(lastStopEventIndex);
  return deDup(activePressData);
};


// forEach pressData
// find first press or release event
// if first found was a release, consider the start event the press.
// if first found was a press, match with the next release event

/**
 * pairify
 * Construct an array of pairs of press/release events
 */
const pairify = (pressData, gameSettings, timePointer, targetId) => {
  const { tl, game, tp } = buildParameters(pressData, gameSettings, timePointer);
  if (typeof targetId === 'undefined') throw new Error('targetId passed to pairify is undefined!')

  var processIndex = 0;
  var pairs = [];

  const cpd = cleansedPressData(tl, game, tp);
  const targetFilter = R.propEq('targetId', targetId);
  const targetPressData = R.filter(targetFilter, cpd);

  const isBluPressEvent = R.propSatisfies(R.test(/^press_blu$/), 'action');
  const isBluReleaseEvent = R.propSatisfies(R.test(/^release_blu$/), 'action');
  const isRedPressEvent = R.propSatisfies(R.test(/^press_red$/), 'action');
  const isRedReleaseEvent = R.propSatisfies(R.test(/^release_red$/), 'action');



  // take a slice of the tl array, find a press action event
  // take a slice of the tl array, find a release action event
  // repeat until processIndex equals the size of the original timeline

  const findNextPressEvent = (colour, timeline) => {
    var idx;
    if (colour === 'blu')
      idx = R.findIndex(isBluPressEvent, timeline);
    else
      idx = R.findIndex(isRedPressEvent, timeline);
    const evt = timeline[idx];
    return { idx, evt };
  }

  const findNextReleaseEvent = (colour, timeline) => {
    var idx
    if (colour === 'blu')
      idx = R.findIndex(isBluReleaseEvent, timeline);
    else
      idx = R.findIndex(isRedReleaseEvent, timeline);
    const evt = timeline[idx];
    return { idx, evt };
  }


  const getPair = (colour, pressData) => {

    const getPressEvent = (c, pIdx) => {
      if (pair.length % 2 === 0) {
        res = findNextPressEvent(
          c,
          R.slice(
            pIdx,
            R.length(targetPressData),
            targetPressData
          )
        );
      }
      else {
        res = findNextReleaseEvent(
          c,
          R.slice(
            pIdx,
            R.length(targetPressData),
            targetPressData
          )
        );
      }
      return res;
    };

    var processIndex = 0;
    var pair = [];
    while (processIndex < tl.length) {
      const res = getPressEvent(colour, processIndex);
      if (res.idx === -1) break;
      processIndex += res.idx;
      pair.push(res.evt);
    }

    return pair;
  }

  const getPairs = (pressData) => {
    const redPairs = getPair('red', targetPressData);
    const bluPairs = getPair('blu', targetPressData);
    return {
      red: redPairs,
      blu: bluPairs
    }
  }


  const ps = getPairs(targetPressData);

  return ps;


};


/**
 * buttonPressProgress
 *
 * Return the team progress percentages at any point in time
 *
 * @param {Array} pressData - Array of (press|release)_\w+ events
 * @param {Object} gameSettings - Game configuration info
 * @param {Number} timePointer - milliseconds since Epoch timestamp of the point in time for which we want to see progress percentages
 * @param {String} targetId - the ID of the D3VICE which we will be calculating percentages for
 * @return {Object} progress
 * @return {Number} progress.red - progress of red team between 0 and 100
 * @return {Number} progress.blu - progress of blu team between 0 and 100
 */
const buttonPressProgress = (pressData, gameSettings, timePointer, targetId) => {
  if (R.isNil(targetId)) throw new Error('targetId is undefined!');
  const { tl, game, tp } = buildParameters(pressData, gameSettings, timePointer);
  const tid = targetId;
  const ps = pairify(tl, game, tp, tid);
  const pairs = R.sortBy(R.prop('createdAt'), R.concat(ps.red, ps.blu));
  const captureRate = game.captureRate;

  const isRed = R.compose(R.test(/_red$/), R.prop('action'));
  const isBlu = R.compose(R.test(/_blu$/), R.prop('action'));

  const progressComputer = (progressOriginal, progressDelta) => {
    const redOrigin = progressOriginal.red;
    const bluOrigin = progressOriginal.blu;
    const redDelta = progressDelta.red;
    const bluDelta = progressDelta.blu;
    const teamProgress = teamProgressCompute(progressOriginal, progressDelta);

    return {
      redProgress: teamProgress.red,
      bluProgress: teamProgress.blu
    };
  }
  const reducer = (acc, thisPdi, idx, pressData) => {
    // if we are at odd item, skip
    // (we are testing odd items in the same step as even items are tested)
    if (isOdd(idx)) return acc;
    // if we are at the last item, consider reduction complete
    if (R.equals(idx, pressData.length-1)) R.reduced(acc);
    const thisTimestamp = R.prop('createdAt', thisPdi);
    const thisEventMoment = moment(thisTimestamp);
    const nextTimestamp = R.prop('createdAt', pressData[idx+1]);
    const nextEventMoment = moment(nextTimestamp);
    const heldDuration = moment.duration(nextEventMoment.diff(thisEventMoment)).valueOf();
    const currentBluDuration = R.prop('blu', acc);
    const capDuration = R.ifElse(
      R.lt(R.multiply(captureRate, 2)),
      R.always(R.multiply(captureRate, 2)),
      R.identity()
    );
    const redHeldDuration = isRed(thisPdi) ? capDuration(heldDuration) : 0;
    const bluHeldDuration = isBlu(thisPdi) ? capDuration(heldDuration) : 0;
    const redProgressSinceLastStep = Math.floor(R.multiply(R.divide(redHeldDuration, captureRate), 100));
    const bluProgressSinceLastStep = Math.floor(R.multiply(R.divide(bluHeldDuration, captureRate), 100));
    const color = () => { if (redHeldDuration) { return 'Red' } else if (bluHeldDuration) {  return 'Blu' } };
    // console.log(`${chalk.white('color:')}${color() === 'Red' ? chalk.red(pad(4, 'Red')) : chalk.blue(pad(4, 'Blue'))} `+
    //             `${chalk.white('action:')}${R.prop('action', thisPdi)} `+
    //             `${chalk.white('thisEventMoment:')}${thisEventMoment.valueOf()} `+
    //             `${chalk.white('nextEventMoment:')}${nextEventMoment.valueOf()} `+
    //             `${chalk.white('heldDur:')}${pad(5, heldDuration)} `+
    //             `${chalk.red('redHeldDur:')}${pad(5, redHeldDuration)} `+
    //             `${chalk.blue('bluHeldDur:')}${pad(5, bluHeldDuration)} `+
    //             `${chalk.red('redProg:')}${pad(3, redProgressSinceLastStep)} `+
    //             `${chalk.blue('bluProg:')}${pad(3, bluProgressSinceLastStep)}`+
    //             `${chalk.white('originalRed:')}${pad(3, acc.red)}`+
    //             `${chalk.white('originalBlu:')}${pad(3, acc.blu)}`
    //           );
    const original = {
      red: acc.red,
      blu: acc.blu
    }
    // can only be one of the other color
    const delta = {
      red: redProgressSinceLastStep,
      blu: bluProgressSinceLastStep
    }
    const { redProgress, bluProgress } = progressComputer(original, delta);
    return {
      red: redProgress,
      blu: bluProgress,
      targetId: tid
    }
  };
  const indexedReduce = R.addIndex(R.reduce);
  const result = indexedReduce(reducer, {blu: 0, red: 0}, pairs);
  // look at a press/release pair
  // If 5 seconds delta in press/release pair, that is 100%.
  // Any > 5000 ms is ignored.
  //
  // we need to return 0-100 at any given point, so we need to calculate historical data in order to derive %
  return result;
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

  if (get.isSameOrBefore(ca)) return { msg: 'over', code: 2};
  // if last evt action was stop and this event action is not a lifecycle action, return stopped
  if (
      R.not(isLifeCycleEvent(thisStepEvent))
  ) return lastGameStatus;
  if (isStartEvent(thisStepEvent)) return { msg: 'running', code: 0 };
  if (isPauseEvent(thisStepEvent)) return { msg: 'paused', code: 1 };
  if (isStopEvent(thisStepEvent)) return { msg: 'stopped', code: 3 };
};

const deriveRemainingGameTime = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveRemainingGameTime requires two parameters');
  // rgt = endTime - now

  const rg = R.prop('gameEndTime', lastStepMetadata);
  if (R.isNil(rg)) return null;
  const get = moment(rg);

  const ca = moment(R.prop('createdAt', thisStepEvent));

  return get.diff(ca);
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
  return lastGameStartTime;
};

const deriveGamePausedDuration = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGamePausedDuration requires two parameters');
  // if the game is paused, incr the pause metadata
  const gpd = moment.duration(lastStepMetadata.gamePausedDuration);
  const ca = moment(thisStepEvent.createdAt);
  const mt = moment(lastStepMetadata.metadataTimestamp);
  if (lastStepMetadata.gameStatus.msg === 'paused') {
    return gpd.add(mt.diff(ca)).valueOf();
  }
  return gpd.valueOf();
};

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
  const delta = moment.duration(ca.diff(mt));
  if (status === 'running' || status === 'paused') return ged.clone().add(delta).valueOf();
  return ged.valueOf();
};

const deriveGameRunningDuration = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameRunningDuration requires two parameters');
  const grd = moment.duration(lastStepMetadata.gameRunningDuration);
  const mt = moment(lastStepMetadata.metadataTimestamp);
  const ca = moment(thisStepEvent.createdAt);
  const elapsed = moment.duration(mt.diff(ca));
  const action = thisStepEvent.action;
  const status = lastStepMetadata.gameStatus.msg;
  if (status === 'running' && (action !== 'pause' && action !== 'stop'))
    return grd.add(elapsed).valueOf();
  return grd.valueOf();
};

const deriveGameEndTime = (lastStepMetadata, thisStepEvent) => {
  if (typeof thisStepEvent === 'undefined') throw new Error('deriveGameEndTime requires two parameters');
  if (R.isNil(R.prop('gameStartTime', lastStepMetadata))) return null;
  const gst = moment(lastStepMetadata.gameStartTime);
  const lget = moment(lastStepMetadata.gameEndTime);
  const gl = lastStepMetadata.gameLength;
  const gpd = lastStepMetadata.gamePausedDuration;
  const status = lastStepMetadata.gameStatus.msg;
  const ca = moment(thisStepEvent.createdAt);
  const mt = moment(thisStepEvent.metadataTimestamp);
  const elapsed = moment.duration(mt.diff(ca));

  if (lget.valueOf() === 0)
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

  const initialMetadata = {
    gameStatus: { msg: 'stopped', code: 3 },
    remainingGameTime: null,
    gameStartTime: null,
    gamePausedDuration: 0,
    gameElapsedDuration: 0,
    gameRunningDuration: 0,
    gameEndTime: 0,
    devicesProgress: [],
    metadataTimestamp: null,
    gameLength: gameSettings.gameLength,
    captureRate: gameSettings.captureRate
  };

  // Sequentially turn events into metadata
  // ORDER MATTERS! Put dependencies first.
  const _calculateGameMetadata = (acc, evt) => {
    acc.metadataTimestamp = deriveMetadataTimestamp(acc, evt);
    acc.gameStartTime = deriveGameStartTime(acc, evt);
    acc.gameEndTime = deriveGameEndTime(acc, evt);
    acc.gameStatus = deriveGameStatus(acc, evt);
    acc.remainingGameTime = deriveRemainingGameTime(acc, evt);
    acc.gamePausedDuration = deriveGamePausedDuration(acc, evt);
    acc.gameElapsedDuration = deriveGameElapsedDuration(acc, evt); // depends on gameStartTime, gameEndTime, and gameStatus
    acc.gameRunningDuration = deriveGameRunningDuration(acc, evt);
    acc.devicesProgress = deriveDevicesProgress(acc, evt);
    acc.theAnswer = 42;
    // console.log(chalk.cyan.bold('EVALUATRON'))
    // console.log(acc);
    return acc;
  };

  return R.reduceWhile(isTimepointerAfter, _calculateGameMetadata, initialMetadata, tl);
}




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
const calculateDevicesProgress = (pressData, gameSettings, timePointer) => {
  const { tl, game, tp } = buildParameters(pressData, gameSettings, timePointer);
  const uniqTargetIds = R.uniq(
    R.map(
      R.prop('targetId'),
      tl
    )
  );
  const rejectList = R.anyPass([
    R.equals('undefined'),
    R.equals('unknown!'),
    R.isNil(),
  ]);

  const prunedUniqTargetIds = R.reject(rejectList, uniqTargetIds);

  const win = (targetId, idx) => {
    return buttonPressProgress(tl, game, tp, targetId);
  };
  return R.map(win, prunedUniqTargetIds);
};

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
    Vue.prototype.$gameStats.gt = gt;
    Vue.prototype.$gameStats.cleansedTimeline = cleansedTimeline;
    Vue.prototype.$gameStats.lifecycleTimeline = lifecycleTimeline;
    Vue.prototype.$gameStats.gamePausedDuration = gamePausedDuration;
    Vue.prototype.$gameStats.activeTimeline = activeTimeline;
    Vue.prototype.$gameStats.gameStartTime = gameStartTime;
    Vue.prototype.$gameStats.gameEndTime = gameEndTime;
    Vue.prototype.$gameStats.gameEndTimeHumanized = gameEndTimeHumanized;
    Vue.prototype.$gameStats.gameStatus = gameStatus;
    Vue.prototype.$gameStats.gameElapsedDuration = gameElapsedDuration;
    Vue.prototype.$gameStats.gameRunningDuration = gameRunningDuration;
    Vue.prototype.$gameStats.gameLength = gameLength;
    Vue.prototype.$gameStats.timePointer = timePointer;
    Vue.prototype.$gameStats.mostRecentStop = mostRecentStop;
    Vue.prototype.$gameStats.remainingGameTime = remainingGameTime;
    Vue.prototype.$gameStats.remainingGameTimeDigital = remainingGameTimeDigital;
    Vue.prototype.$gameStats.remainingGameTimeHumanized = remainingGameTimeHumanized;
    Vue.prototype.$gameStats.activeTimelineVs = activeTimelineVs;
    Vue.prototype.$gameStats.cleansedPressData = cleansedPressData;
    Vue.prototype.$gameStats.buttonPressProgress = buttonPressProgress;
    Vue.prototype.$gameStats.calculateDevicesProgress = calculateDevicesProgress;
    Vue.prototype.$gameStats.buildPressParameters = buildPressParameters;
    Vue.prototype.$gameStats.pairify = pairify;
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
  },
  gt,
  cleansedTimeline,
  lifecycleTimeline,
  gamePausedDuration,
  activeTimeline,
  gameStartTime,
  gameEndTime,
  gameEndTimeHumanized,
  gameStatus,
  gameElapsedDuration,
  gameRunningDuration,
  gameLength,
  timePointer,
  mostRecentStop,
  remainingGameTime,
  remainingGameTimeDigital,
  remainingGameTimeHumanized,
  activeTimelineVs,
  cleansedPressData,
  buttonPressProgress,
  calculateDevicesProgress,
  buildPressParameters,
  pairify,
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
}