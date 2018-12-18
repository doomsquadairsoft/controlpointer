// marshal.js
//
// Update control point progress bars

const moment = require('moment');
const R = require('ramda');
const GameStats = require('../src_shared/GameStats.js')


module.exports = class Marshal {
  constructor (timelineService) {
    this.timelineService = timelineService;
  }
  tick() {
    const tl = this.timelineService.find().then(tl => {
      var gs = new GameStats(tl);

      console.log(`Game Started: ${gs.gameStartTime()}, Duration: ${gs.gameDuration()}, Paused Duration: ${gs.gamePausedDuration()}, End: ${gs.gameEndTime()}`)
    })
  }
}
