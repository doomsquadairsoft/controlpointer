const _ = require('lodash'); // please phase out
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

  gameEndTime() {
    if (this.activeTimeline.length < 1) return moment(0);
    return moment(this.gameStartTime).add(this.gameDuration).add(this.gamePausedDuration);
  }

  activeTimeline() {
    // activeTimeline is an array of cleansed timeline events
    // following the latest stop event
    // if there is no stop event, it is the entire cleansed timeline.
    var cleansedTimeline = this.cleansedTimeline;
    if (cleansedTimeline.length < 1) return [];

    var lastStopEventIndex = _.findLastIndex(cleansedTimeline, {
      action: 'stop'
    })
    if (lastStopEventIndex === -1)
      return this.cleansedTimeline

    return this.cleansedTimeline.slice(
      lastStopEventIndex + 1,
      this.cleansedTimeline.length
    )

  }

  cleansedTimeline() {
    // cleansedTimeline is the timeline without duplicate events (see below)
    var gis = this.timeline;

    // remove any duplicate pause or start timeline events
    // example: start, pause, pause, start, start =>
    //          start, pause, start
    // (source and target must also be a match to get rejected)
    var filtered = _.filter(gis, (g, index, collection) => {
      // if we aren't iterating on the last array element,
      // inspect the next element and see if that element's action is a duplicate of this element's action
      if (index !== collection.length - 1) {
        if (
          g.action === collection[index + 1].action &&
          g.source === collection[index + 1].source &&
          g.target === collection[index + 1].target
        ) {
          collection[index + 1].invalid = true;
        }
      }
      return g.invalid === true ? false : true
    });

    return filtered;
  }
}


module.exports = GameStats;
