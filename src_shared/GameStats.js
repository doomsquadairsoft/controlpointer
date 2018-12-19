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
    //this.timePointer = this.buildTimePointer();


    // @TODO If the game is paused, set the pointer to the time at which the game was paused
    // If the most recent action was a press, set the pointer to now
    // otherwise, set the pointer to the most recent release time



  }


  //
  // buildTimePointer() {
  //   return this.texasBlu().then((tb) => {
  //     if (_.last(tb.action === 'press_blu'))
  //       return moment().valueOf();
  //     else
  //       return moment(_.last(tb.createdAt));
  //   });
  // }


  // texasBlu() {
  //   return this.getActiveTimeline().then((at) => {
  //     console.log(`at=${at}`)
  //     return _.filter(at, (evt) => {
  //       return (
  //         evt.action.match(/_blu/) &&
  //         evt.target === 'texas'
  //       );
  //     })
  //   })
  // }

  // getActiveTimeline() {
  //   return this.getMostRecentStop().then((mrs) => {
  //     console.log(`mrs=${mrs}`)
  //     return this.timelineAfterDate(mrs);
  //   });
  // }


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

  gamePausedDuration() {
    var tl = this.activeTimeline();
    const sumPauseDuration = (acc, evt) => {
      R.while(
        R.propEq('action', 'pause'),
        R.add(acc, 'createdAt')
      )
    }
  }

  gameEndTime() {
    if (this.activeTimeline.length < 1) return moment(0);
    return moment(this.gameStartTime()).add(this.gameDuration()).add(this.gamePausedDuration());
  }

  gameStartTime() {
    return 'bbbb'
    const tl = cleansedTimeline();

  }


  activeTimeline() {
    // activeTimeline is an array of cleansed timeline events
    // following the latest stop event
    // if there is no stop event, it is the entire cleansed timeline.
    var ct = this.cleansedTimeline();
    if (ct.length < 1) return [];


    const lastStopEventIndex = R.findLastIndex(
      R.propEq('action', 'stop')
    );

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

    // remove any duplicate pause or start timeline events
    // example: start, pause, pause, start, start =>
    //          start, pause, start
    // (source and target must also be a match to get rejected)
    const isDuplicate = (evt, idx, col) => {
      if (idx !== col.length - 1) {
        if (
          evt.action === col[idx + 1].action &&
          evt.source === col[idx + 1].source &&
          evt.target === col[idx + 1].target
        ) {
          col[idx + 1].invalid = true;
        }
      }
      return evt.invalid === true ? false : true
    };

    const filterIndexed = R.addIndex(R.filter);
    return filterIndexed(isDuplicate, sortedTimeline);

    // if we aren't iterating on the last array element,
    // inspect the next element and see if that element's action is a duplicate of this element's action

  }
}


module.exports = GameStats;
