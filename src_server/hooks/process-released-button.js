// This hook patches a device every 5 seconds after a button is released.
// This is to decrement the d3vice progress when the d3vice is not completely captured

const gameStats = require('../../src_shared/gameStats');
const Promise = require('bluebird');
const R = require('ramda');
const defaults = require('../../src_shared/defaults');


module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    // Get `app`, `method`, `params` and `result` from the hook context
    const {
      app,
      method,
      result,
      params
    } = context;

    // [x] create interval timer when a release_* event is created
    // [x] the timer runs every 5 seconds
    //   [x] the timer creates a unhold_(red|blu) event in the timeline
    //   [x] the timer is cancelled when it expires after (captureRate*2);
    //   [x] the timer is cancelled if a press_* event occurs with the same targetId
    //   [x] the timer is cancelled if (color) progress reaches 0
    //   [ ] the timer is cancelled if (color) progress reaches 100



    /**
     * Determine if a press timeline event has occured AFTER the supplied event
     */
    const waitForPressedDetermination = (releaseEvt) => {
      const gameId = releaseEvt.gameId;
      const targetId = releaseEvt.targetId;
      const target = releaseEvt.target;
      const color = gameStats.isRed(releaseEvt) ? 'red' : 'blu';
      return app.service('timeline').find({
        query: {
          gameId: gameId,
          targetId: targetId,
          action: `press_${color}`,
          $sort: {
            createdAt: -1
          },
          $limit: 1
        },
      }).then((evts) => {
        const lastPressEvent = evts[0];
        const isPressed = (releaseEvt.createdAt < lastPressEvent.createdAt);
        // console.log(`  \n\n👷🏽  [RELEASED] EVALUATRON! \n\n the button HAS${isPressed ? ' ' : ' NOT '}pressed!`)
        // console.log(evts)
        // console.log(lastPressEvent)
        if (typeof lastPressEvent === 'undefined') return false;
        if (isPressed) return true;
        return false;
      })
    }


    /**
     * waitForUnholdEventCreation
     *
     * Creates an unhold_(red|blu) timeline event
     *
     * @param {Object} releaseEvt - the original release event which started the inverval timer
     * @return {Promise}
     */
    const waitForUnholdEventCreation = (releaseEvt) => {
      const gameId = releaseEvt.gameId;
      const targetId = releaseEvt.targetId;
      const target = releaseEvt.target;
      const color = gameStats.isRed(releaseEvt) ? 'red' : 'blu';
      return app.service('timeline').create({
        'type': 'timeline',
        'action': `unhold_${color}`,
        'gameId': gameId,
        'source': 'server',
        'target': target,
        'targetId': targetId
      });
    }

    /**
     * waitForProgressDetermination
     *
     * Find the up-to-date d3vice progress
     *
     * @param {Object} releaseEvt - the original release event which started the inverval timer
     * @param {Promise}
     */
    const waitForProgressDetermination = (releaseEvt) => {
      const gameId = releaseEvt.gameId;
      const targetId = releaseEvt.targetId;
      const target = releaseEvt.target;
      const color = gameStats.isRed(releaseEvt) ? 'red' : 'blu';
      return app.service('devices').find({
        query: {
          _id: targetId,
          $limit: 1
        },
      }).then((res) => {
        const d = res[0];
        // console.log(`  device in question:`)
        // console.log(d)
        const isProgressMaxed = (color === 'red') ? (d.redProgress === 100) : (d.bluProgress === 100);
        const isProgressNil = (color === 'red') ? (d.redProgress === 0) : (d.bluProgress === 0);
        return [ isProgressMaxed, isProgressNil ];
      })
    }

    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const timeline = method === 'find' ? result.data : [result];


    const evt = timeline[0];

    if (gameStats.isReleaseEvent(evt)) {
      // console.log(`  🕴️process-released-button`)
      // console.log(evt);

      // Get the game ID from the timeline event we are inspecting
      const gameId = evt.gameId;

      if (gameId === defaults.unknown) return context;

      // Set the max amount of time a interval timer can run for.
      // this is set to the game's captureRate*2

      const gameLookup = app.service('game').find({
        query: {
          _id: gameId
        }
      })

      const captureRateLookup = gameLookup.then((g) => {
        // console.log(`  g:${JSON.stringify(g)}`)
        const game = g[0];
        return game.captureRate;
      });

      const combinator = Promise.all([captureRateLookup, evt]).then((p) => {
        // console.log(`  p: ${JSON.stringify(p)}`)
        const cr = p[0];
        const evt = p[1];
        return { evt, cr };
      });

      const releaseDeterminator = combinator.then((p) => {
        const { cr, evt } = p;
        const ire = gameStats.isReleaseEvent(evt);
        return { cr, evt, ire };
      });

      const timerStarter = releaseDeterminator.then((p) => {
        const { ire, cr, evt } = p;
        var timer;
        if (ire) {
          const color = gameStats.isRed(evt) ? 'red' : 'blu';

          // start an inteval timer which creates a new unhold_* timeline event,
          // decrementing the progress if it hadn't reached 100
          timer = setInterval(() => {
            // If a press event has not yet been seen, create a unhold event.

            Promise.all([
              waitForPressedDetermination(evt),
              waitForProgressDetermination(evt),
            ]).then((p) => {
              // console.log(p)
              const isPressed = p[0];
              const isProgressMaxed = p[1][0];
              const isProgressNil = p[1][1];
              if (isPressed) console.log(`  ✔️ Cancelling unhold timer due to PRESS event`)
              if (isProgressMaxed) console.log(`  ✔️ Cancelling unhold timer due to MAX progress`)
              if (isProgressNil) console.log(`  ✔️ Cancelling unhold timer due to NIL progress`)
              if (isPressed || isProgressMaxed || isProgressNil) return clearInterval(timer);
              waitForUnholdEventCreation(evt);
            });
          }, 5000);

          // clear the interval timer either when a press_(blu|red) event is seen,
          // or the maximum timeout occurs
          setTimeout(() => {
            console.log(`  ⌚ Button Unhold Timeout.`)
            clearInterval(timer);
          }, (cr*2));
        }

        return { ire, cr, evt, timer };
      })
    }

    return context;

  };
};
