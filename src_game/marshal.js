// marshal.js
//
// Update control point progress bars

const moment = require('moment');
const R = require('ramda');
const gameStats = require('../src_shared/gameStats.js')
const Promise = require('bluebird');
const playerButtonRegex = /(press|release)_\w{3}/;


module.exports = class Marshal {
  constructor (timelineService, gameService, devicesService) {
    this.timelineService = timelineService;
    this.gameService = gameService;
    this.devicesService = devicesService
  }
  tick() {
    const tl = this.timelineService.find();
    const game = this.gameService.find();
    const devices = this.devicesService.find();

    Promise.all([tl, game, devices])
    .spread((tl, game) => {

      const {
        gameStatus,
        gameStartTime,
        gameElapsedDuration,
        gamePausedDuration,
        gameEndTime,
        devicesProgress
      } = gameStats.calculateMetadata(tl, game);

      console.log(`Status: ${gameStatus.msg}, Start: ${gameStartTime}, Dur: ${gameElapsedDuration}, Paused Dur: ${gamePausedDuration}, End: ${gameEndTime}`)

      // get info on control point button presses
      console.log(devicesProgress);

      R.forEach((d) => {
        if (typeof d.targetId !== 'undefined')
          this.devicesService.patch(d.targetId, {bluProgress: d.blu, redProgress: d.red}, {});
      }, devicesProgress);


    });
  }
}
