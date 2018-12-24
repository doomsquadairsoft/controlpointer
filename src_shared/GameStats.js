const R = require('ramda');
const moment = require('moment');


/**
 * GameStats
 *
 * Handles calculation of game timers.
 *
 * @param {Array} timeline              - Timeline array from feathers/nedb
 * @param {Object} options              - Options which will influence how the game stats are reported
 * @param {String} options.gameType     - Identification for the game mode. ex: 'counter-strike' or 'koth' (King of the Hill)
 * @param {Number} options.gameDuration - Total number of ms which the game should last for
 */
class GameStats {

  constructor(timeline, options) {
    this.timeline = timeline;
    this._gameStartTime = this.gameStartTime();
    this._timePointer = this.buildTimePointer();


    // @TODO If the game is paused, set the pointer to the time at which the game was paused
    // If the most recent action was a press, set the pointer to now
    // otherwise, set the pointer to the most recent release time



  }

  get timePointer() {
    return this._timePointer;
  }

  set timePointer(timestamp) {
    this._timePointer = timestamp;
  }

  buildTimePointer() {
    return moment().valueOf();
  }

  /**
   * timelineAfterDate
   * @param {String} date - date in milliseconds
   * @returns {Promise}
   */
  timelineAfterDate(date) {
    date = parseInt(date);
    const afterDate = item => R.gt(R.prop('createdAt', item), date);
    return R.sortBy(
      R.prop('createdAt'), this.timeline
    ).filter(
      afterDate
    );
  }

  mostRecentStop() {
    const sort = R.sortBy(
      R.prop('createdAt'), this.timeline
    )

    const last = R.findLast(
      R.propEq('action', 'stop'), sort
    )

    return R.prop('createdAt', last);
  }

  deDup(arr) {
    const filterIndexed = R.addIndex(R.filter);
    const isItemValid = (evt, idx, col) => {
      if (idx == col.length-1) return true;
      if (
        R.equals(
          R.prop('action', evt),
          R.prop('action', col[idx+1])
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
  }

  gamePausedDuration() {
    // Go through each timeline event
    const indexedMap = R.addIndex(R.map);
    const lifecycleTimeline = this.lifecycleTimeline();

    const algo = (evt, idx, col) => {

      if (idx % 2 === 0) return 0; // only process odd events (pauses)

      const thisTimestamp = moment(evt.createdAt);
      const resumeTimestamp = ((idx, col) => {
        if ((idx+1) === col.length) {
          return moment(this.timePointer);
        }
        else return moment(col[idx+1].createdAt);
      })(idx, col);

      const msDelta = moment.duration(
        resumeTimestamp.diff(thisTimestamp)
      );

      return msDelta.valueOf();
    }

    const pausedDurations = indexedMap(algo, lifecycleTimeline);
    const duration = R.reduce(R.add, 0, pausedDurations);
    return duration;
  }

  gameStatus() {
    const lctl = this.lifecycleTimeline();
    const mostRecentLifecycleEvent = R.last(lctl);
    const gameEndTime = this.gameEndTime();
    const now = moment(this.timePointer);

    console.log(`\
    GameEndTime: ${moment(gameEndTime).format()} (${moment(gameEndTime).valueOf()})\n\
    GameNowTime: ${moment(this.timePointer).format()} (${moment(this.timePointer).valueOf()})\n\
    isEnded?: ${(now.isAfter(gameEndTime))}`);

    console.log(lctl)

    if (lctl.length == 0) return { code: 2, msg: 'stopped' };
    if (now.isAfter(gameEndTime)) return { code: 3, msg: 'over' };
    if (mostRecentLifecycleEvent.action === 'start') return { code: 0, msg: 'running' };
    if (mostRecentLifecycleEvent.action === 'pause') return { code: 1, msg: 'paused' };

  }

  gameElapsedTime() {
    const gameStartTime = moment(this.gameStartTime());
    const now = moment(this.timePointer);
    return moment.duration(now.diff(gameStartTime)).valueOf();
  }

  gameEndTime() {
    if (this.activeTimeline().length < 1) return moment(0).valueOf();
    const gameEndTime = moment(this.gameStartTime()).add(this.gameElapsedTime()).subtract(this.gamePausedDuration()).valueOf();
    return gameEndTime;
  }

  gameStartTime() {
    const tl = this.activeTimeline();
    const startEvent = R.find(
      R.propEq('action', 'start'),
      tl
    )
    return R.prop('createdAt', startEvent);
  }

  lifecycleTimeline() {
    const tl = this.activeTimeline();
    const isLifeCycleEvent = (evt) => (evt.action === 'start' || evt.action === 'pause') ? true : false;
    const lifecycleTimeline = R.filter(isLifeCycleEvent, tl);
    return lifecycleTimeline;
  }

  activeTimeline() {
    // activeTimeline is an array of cleansed timeline events
    // following the latest stop event up until the timePointer
    // if there is no stop event, it is the entire cleansed timeline.
    var ct = this.cleansedTimeline();
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

    const tp = this._timePointer;

    const isEventBeforePointer = (evt) => {
      return R.lte(
        R.prop('createdAt', evt),
        tp
      );
    }

    const activeTimeline = R.filter(isEventBeforePointer, relevantTimeline);

    //console.log(activeTimeline)
    //R.forEach(R.compose(console.log, R.props(['createdAt', 'action'])), activeTimeline);

    return activeTimeline;
  }

  cleansedTimeline() {
    // cleansedTimeline is the timeline without duplicate events
    var gis = this.timeline;

    const sortByTimestamp = R.sortBy(R.prop('createdAt'));
    const sortedTimeline = sortByTimestamp(gis);

    return this.deDup(sortedTimeline);

  }
}


module.exports = GameStats;
