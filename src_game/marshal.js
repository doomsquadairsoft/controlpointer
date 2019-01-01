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

      const gameTest = gameStats.gt(tl, game);
      const gameStatus = gameStats.gameStatus(tl, game);
      const gameStartTime = gameStats.gameStartTime(tl, game);
      const gameElapsedDuration = gameStats.gameElapsedDuration(tl, game);
      const gamePausedDuration = gameStats.gamePausedDuration(tl, game);
      const gameEndTime = gameStats.gameEndTime(tl, game);
      console.log(`Status: ${gameStatus.msg}, Start: ${gameStartTime}, Dur: ${gameElapsedDuration}, Paused Dur: ${gamePausedDuration}, End: ${gameEndTime}`)

      // get info on control point button presses
      const activeTimeline = gameStats.activeTimeline(tl, game);
      this.calculateDeviceProgress(tl, game, devices);
    });


  }

  calculateDeviceProgress(tl, game, devices) {
    const at = gameStats.activeTimeline(tl, game);
    const pressReleaseEvtFilter = (tli) =>
      R.test(playerButtonRegex, R.prop('action', tli))
    const pressReleaseEvents = R.filter(pressReleaseEvtFilter, at);
    //console.log(pressReleaseEvents);

    const echoAll = R.forEach((item) => {
      //console.log(R.prop('targetId', item));
      //console.log(`action:${R.prop('action', item)} targetId:${R.prop('targetId', item)}`);
      console.log(item)
    });


    const prePairFilter = (item) => R.test(/press_\w{3}/, R.prop('action', item));
    const prePairs = R.filter(prePairFilter, pressReleaseEvents);


    const exampleOfTheDataWeWantToEndUpWith = [
      [
        { 'action': 'press_blu' },
        { 'action': 'press_blu' }
      ],
      [
        { 'action': 'press_blu' },
        { 'action': 'press_blu' }
      ]
    ];


  const uniqTargetIds = R.uniq(
    R.map(
      R.prop('targetId'),
      prePairs
    )
  );





  // for each uniqTargetId, DO SOMETHING



  //echoAll(uniqTargetIds);

}

  // Compile Array of (press|release)_\s+ events.
  // Compute the current (timePointer) progress state of each device.
  // for each press_\s+ release_\s pair, get the diff.
  // Starting with gameStartTime, add up the diffs
}
