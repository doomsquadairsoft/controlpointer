const R = require('ramda');
const moment = require('moment');
const chalk = require('chalk');
const columns = require('cli-columns');


const isOdd = R.modulo(R.__, 2);
const isEven = R.complement(isOdd);

/*
 * GameStats
 * Handles calculation of game timers.
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
    tl = findTimelineInStore;
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
  //console.log(`${lastStopEventIndex}|${R.length(activePressData)}, these two should be the same ${R.prop('createdAt', R.last(sortedPressData))}, ${R.prop('createdAt', R.last(activePressData))}`)
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
    // console.log(timeline.length)
    // console.log(timeline)
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
  // R.forEach((p) => {
  //   const values = [
  //       `${chalk.red('action:')}${R.prop('action', p)}`,
  //       `${chalk.red('createdAt:')}${R.prop('createdAt', p)}`,
  //       `${chalk.red('target:')}${R.prop('target', p)}`
  //   ];
  //   console.log(columns(values));
  // }, ps.red);
  // R.forEach((p) => {
  //   const values = [
  //       `${chalk.blue('action:')}${R.prop('action', p)}`,
  //       `${chalk.blue('createdAt:')}${R.prop('createdAt', p)}`,
  //       `${chalk.blue('target:')}${R.prop('target', p)}`
  //   ];
  //   console.log(columns(values));
  // }, ps.blu)
  return ps;


};

/**
 * calculatePressProgress
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
const calculatePressProgress = (pressData, gameSettings, timePointer, targetId) => {
  if (R.isNil(targetId)) throw new Error('targetId is undefined!');
  const { tl, game, tp } = buildParameters(pressData, gameSettings, timePointer);
  const tid = targetId;
  const pairs = pairify(tl, game, tp, tid);
  const captureRate = game.captureRate;

  const isRed = R.compose(R.test(/_red$/), R.prop('action'));
  const isBlu = R.compose(R.test(/_blu$/), R.prop('action'));
  const isOdd = R.modulo(R.__, 2);





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
      R.always(heldDuration)
    );

    const redHeldDuration = isRed(thisPdi) ? capDuration(heldDuration) : 0;
    const bluHeldDuration = isBlu(thisPdi) ? capDuration(heldDuration) : 0;

    //
    // const question = {
    //   bluProgress: 100,
    //   redProgress: 0,
    //   heldDuration: 20000,
    //   color: red
    // };
    //
    // const answer = {
    //   bluProgress: 0,
    //   redProgress: 100
    // };

    //console.log(R.multiply(R.divide(redHeldDuration, captureRate), 100))
    const redProgressSinceLastStep = Math.floor(R.multiply(R.divide(redHeldDuration, captureRate), 100));
    const bluProgressSinceLastStep = Math.floor(R.multiply(R.divide(bluHeldDuration, captureRate), 100));
    const color = () => { if (redHeldDuration) { return 'Red' } else if (bluHeldDuration) {  return 'Blu' } }
    //console.log(`|${color()}| action:${thisPdi.action}, nextEventMoment:${nextEventMoment.valueOf()}, heldDur:${heldDuration} redHeldDur:${redHeldDuration}, bluHeldDuration:${bluHeldDuration}, caprate:${captureRate}, bluProg:${bluProgressSinceLastStep}, redProg:${redProgressSinceLastStep}`)

    const computor = (progressOriginal, progressDelta) => {
      const capPercentage = R.ifElse(
        R.flip(R.gt)(100),
        R.always(100),
        R.identity
      );
      const redOrigin = progressOriginal.red;
      const bluOrigin = progressOriginal.blu;
      const redDelta = progressDelta.red;
      const bluDelta = progressDelta.blu;
      const redProgress = (redDelta) ? capPercentage(redOrigin + redDelta) : 0;
      const bluProgress = (bluDelta) ? capPercentage(bluOrigin + bluDelta) : 0;

      return { redProgress, bluProgress };
    }

    const original = {
      red: acc.red,
      blu: acc.blu
    }

    // can only be one of the other color
    const delta = {
      red: redProgressSinceLastStep,
      blu: bluProgressSinceLastStep
    }

    const { redProgress, bluProgress } = computor(original, delta);
    //console.log(`${redProgress}, ${bluProgress}`);

    return {
      red: redProgress,
      blu: bluProgress,
      targetId: tid
    }

  };

  const indexedReduce = R.addIndex(R.reduce);
  const result = indexedReduce(reducer, {blu: 0, red: 0}, pairs);
  // result.blu = indexedReduce(reducer, 0, bluData);
  // result.red = indexedReduce(reducer, 0, redData);


  // look at a press/release pair
  // If 5 seconds delta in press/release pair, that is 100%.
  // Any > 5000 ms is ignored.
  //
  // we need to return 0-100 at any given point, so we need to calculate historical data in order to derive %

  return result;
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
    return calculatePressProgress(tl, game, tp, targetId);
  };
  return R.map(win, prunedUniqTargetIds);
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
    Vue.prototype.$gameStats.calculatePressProgress = calculatePressProgress;
    Vue.prototype.$gameStats.calculateDevicesProgress = calculateDevicesProgress;
    Vue.prototype.$gameStats.buildPressParameters = buildPressParameters;
    Vue.prototype.$gameStats.pairify = pairify;
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
  calculatePressProgress,
  calculateDevicesProgress,
  buildPressParameters,
  pairify
}
