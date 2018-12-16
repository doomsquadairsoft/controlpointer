/**
 * Marshall handles game "tick" time events
 */


const moment = require('moment');
const _ = require('lodash');
const GameStats = require('../../src_shared/GameStats.js')

module.exports = (app) => {


  var lastTickTime = moment().valueOf();
  var last = 'tock';





    var timeline = app.service('timeline');
    var devices = app.service('devices');
    const gs = new GameStats(timeline);

    function updateProgressBars() {
      return getMostRecentStop(timeline).then(tl => {
        return

      })
    }

    function getDevices() {
      return _.map(devices.find(), (d) => {
        return d
      }
    })

    function getMostRecentStop(tl) {
      return tl.find({
        query: {
          $limit: 1,
          $sort: {
            createdAt: -1
          },
          action: 'stop'
        }
      }).then((t) => t[0].createdAt)
    }




    gs.texasBlu().then((texasBlu) => {
      console.log(`texasBlu=${texasBlu}`)



        // get the total amount of time that the button has been held
        var ppp = [];
        _.each(texasBlu, (t, i) => {
          if (t.action === 'press_blu') {
            const pressTime = moment(t.createdAt);

            var releaseTime;
            if (i === (texasBlu.length - 1)) {
              releaseTime = gs.timePointer;
            } else {
              releaseTime = moment(texasBlu[i + 1].createdAt);
            }


            const diff = moment.duration(releaseTime.diff(pressTime));
            ppp.push(diff.valueOf());
          }

        })

        console.log(ppp);

        var reduced = _.reduce(ppp, (acc, key, i, col) => {
          return acc += key;
        })

        console.log(`reduced=${reduced} reducedSeconds=${reduced/1000}`)

        const pointsPerSecond = 5;
        const totalSeconds = reduced / 1000;
        const points = totalSeconds * pointsPerSecond;
        const pointsInt = parseInt(points);

        console.log(`calculated points=${points} (${pointsInt})`)

        devices.patch('wUhdhYiukXbivIvL', {
          bluProgress: pointsInt
        })

      })



    if (last === 'tock') console.log(`[Marshal]: ${last = 'tick'}`)
    else console.log(`[Marshal]: ${last = 'tock'}`)

  setInterval(updateProgressBars, 1000);

};
