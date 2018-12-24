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

      console.log(`Status: ${gs.gameStatus().msg}, Start: ${gs.gameStartTime()}, Dur: ${gs.gameDuration()}, Paused Dur: ${gs.gamePausedDuration()}, End: ${gs.gameEndTime()}`)
    })
  }
}
