const R = require('ramda');
const moment = require('moment');


/**
 * GameStats
 *
 * Handles calculation of game timers.
 *
 * @param {Array} timeline - timeline array from feathers/nedb
 */
class GameStats {

  constructor(timeline, options) {
    this.timeline = timeline;
    this._gameStartTime = this.gameStartTime();
    this.timePointer = this.buildTimePointer();


    // @TODO If the game is paused, set the pointer to the time at which the game was paused
    // If the most recent action was a press, set the pointer to now
    // otherwise, set the pointer to the most recent release time



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
    const tl = this.activeTimeline();
    const isLifeCycleEvent = (evt) => (evt.action === 'start' || evt.action === 'pause') ? true : false;
    const lifecycleTimeline = R.filter(isLifeCycleEvent, tl);
    console.log(lifecycleTimeline)

    const algo = (evt, idx, col) => {

      if (idx % 2 === 0) return 0; // only process odd events (pauses)

      const thisTimestamp = moment(evt.createdAt);
      const resumeTimestamp = ((idx, col) => {
        if ((idx+1) === col.length) return moment(this.timePointer);
        else return moment(col[idx+1].createdAt);
      })(idx, col);

      const msDelta = moment.duration(
        resumeTimestamp.diff(thisTimestamp)
      ).valueOf();

      return msDelta;
    }

    const pausedDurations = indexedMap(algo, lifecycleTimeline);
    const duration = R.reduce(R.add, 0, pausedDurations);
    console.log(pausedDurations);
    return duration;
  }

  gameDuration() {
    const gameStartTime = moment(this.gameStartTime());
    const now = moment();
    return moment.duration(now.diff(gameStartTime)).valueOf();
  }

  gameEndTime() {
    if (this.activeTimeline.length < 1) return moment(0).valueOf();
    return moment(this.gameStartTime()).add(this.gameDuration()).add(this.gamePausedDuration()).valueOf();
  }

  gameStartTime() {
    const tl = this.activeTimeline();
    const startEvent = R.find(
      R.propEq('action', 'start'),
      tl
    )
    return R.prop('createdAt', startEvent);
  }


  activeTimeline() {
    // activeTimeline is an array of cleansed timeline events
    // following the latest stop event
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


    // const decider = R.cond([
    //   [R.equals(-1), R.always(ct)],
    //   [R.equals(), R.always()],
    // ]);

    const otherDecider = R.ifElse(
      R.equals(-1),
      R.always(ct),
      R.always(allEventsAfterLastStopEvent)
    );

    return otherDecider(lastStopEventIndex);
    //
    //
    // if (lastStopEventIndex === -1)
    //   return this.cleansedTimeline
    //
    // return this.cleansedTimeline.slice(
    //   lastStopEventIndex + 1,
    //   this.cleansedTimeline.length
    // )

  }

  cleansedTimeline() {
    // cleansedTimeline is the timeline without duplicate events (see below)
    var gis = this.timeline;

    const sortByTimestamp = R.sortBy(R.prop('createdAt'));
    const sortedTimeline = sortByTimestamp(gis);

    return this.deDup(sortedTimeline);

  }
}


module.exports = GameStats;
