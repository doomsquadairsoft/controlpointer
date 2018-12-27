// marshal.js
//
// Update control point progress bars

const moment = require('moment');
const R = require('ramda');
const GameStats = require('../src_shared/GameStats.js')
const Promise = require('bluebird');


module.exports = class Marshal {
  constructor (timelineService, gameService) {
    this.timelineService = timelineService;
    this.gameService = gameService;
  }
  tick() {
    const tl = this.timelineService.find();
    const game = this.gameService.find();

    Promise.all([tl, game])
    .spread((tl, game) => {

      var gs = new GameStats(tl, game);

      console.log(`Status: ${gs.gameStatus().msg}, Start: ${gs.gameStartTime()}, Dur: ${gs.gameElapsedDuration()}, Paused Dur: ${gs.gamePausedDuration()}, End: ${gs.gameEndTime()}`)
    })
  }
}
