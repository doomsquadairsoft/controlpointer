// This hook patches a device every 5 seconds when it's button is held down.
// This is to make the UI reactive to the user's input, rather than waiting to react when they let go of the button.

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

    const waitForReleasedDetermination = (pressEvt) => {
      const gameId = pressEvt.gameId;
      const targetId = pressEvt.targetId;
      const target = pressEvt.target;
      const color = gameStats.isRed(pressEvt) ? 'red' : 'blu';
      return app.service('timeline').find({
        query: {
          gameId: gameId,
          targetId: targetId,
          action: `release_${color}`,
          $sort: {
            createdAt: -1
          },
          $limit: 1
        },
      }).then((evts) => {
        const lastReleaseEvent = evts[0];
        if (typeof lastReleaseEvent === 'undefined') return false;
        const isReleased = (pressEvt.createdAt < lastReleaseEvent.createdAt);
        console.log(`  \n\n🎮  EVALUATRON! \n\n the button HAS${isReleased ? ' ' : ' NOT '}released!`)
        if (isReleased) return true
        return false;
      })
    }

    const waitForHoldEventCreation = (pressEvt) => {
      const gameId = pressEvt.gameId;
      const targetId = pressEvt.targetId;
      const target = pressEvt.target;
      const color = gameStats.isRed(pressEvt) ? 'red' : 'blu';
      return app.service('timeline').create({
        'type': 'timeline',
        'action': `hold_${color}`,
        'gameId': gameId,
        'source': 'server',
        'target': target,
        'targetId': targetId
      });
    }

    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const timeline = method === 'find' ? result.data : [result];


    const evt = timeline[0];

    // Get the game ID from the timeline event we are inspeting
    const gameId = evt.gameId;
    // console.log(`gameid: ${gameId}`)

    if (gameId === defaults.unknown) return context;

    // Set the max amount of time a interval timer can run for.
    // this is set to the game's captureRate

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

    const pressDeterminator = combinator.then((p) => {
      const { cr, evt } = p;
      const ipe = gameStats.isPressEvent(evt);
      return { cr, evt, ipe };
    });

    const timerStarter = pressDeterminator.then((p) => {
      const { ipe, cr, evt } = p;
      var timer;
      if (ipe) {
        const color = gameStats.isRed(evt) ? 'red' : 'blu';

        // start an inteval timer which creates a new timeline event,
        // forcing a UI update.
        timer = setInterval(() => {
          // If a release event has not yet been seen, create a hold event.

          waitForReleasedDetermination(evt).then((isReleased) => {
            if (isReleased) clearInterval(timer);
            waitForHoldEventCreation(evt);
          });
        }, 5000);

        // clear the interval timer either when a release_(blu|red) event is seen,
        // or the maximum timeout occurs
        setTimeout(() => {
          clearInterval(timer);
        }, (cr*2.3));
      }

      return { ipe, cr, evt, timer };
    })


    // determine if this timeline event is a press_(blu|red) event.
    // if so, create an interval timer which patches the appropriate d3vice
    // console.log(timeline);

    const evtAction = timeline[0].action;
    // console.log(`  the inspected timeline event is of type ${evtAction}`)

    // const metadataLookup = context.app.service('metadata').find({
    //   query: {
    //     gameId: gameId,
    //     $sort: {
    //       createdAt: -1
    //     },
    //     $limit: 1
    //   }
    // });
    //
    // const gameSettingsLookup = context.app.service('game').find({
    //   query: {
    //     _id: gameId,
    //   },
    // });
    //
    // const waitForMetadataComputation = Promise.all([metadataLookup, gameSettingsLookup]).then((res) => {
    //   const lastMetadata = res[0][0]; // => { metadata: { remainingGameTime: n, ...}, gameId: xyz }
    //   const gameSettings = res[1][0];
    //   const initialMetadata = { metadata: gameStats.buildInitialMetadata(gameSettings) };
    //   const lmd = R.ifElse(R.isNil(), R.always(initialMetadata), R.identity())(lastMetadata);
    //   const metadata = gameStats.deriveMetadata(lmd.metadata, result);
    //   return metadata;
    // });
    //
    //
    // const waitForMetadataCreation = waitForMetadataComputation.then((thisMetadata) => {
    //   const wrappedMetadata = {
    //     metadata: thisMetadata,
    //     gameId: gameId
    //   };
    //   return context.app.service('metadata').create(wrappedMetadata);
    // });
    //
    // waitForMetadataCreation.catch((e) => {
    //   console.error('Problem calculating metadata! See Error below.')
    //   console.error(e);
    // });

    return context;

  };
};
