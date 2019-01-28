// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const gameStats = require('../../src_shared/gameStats');
const Promise = require('bluebird');
const R = require('ramda');

module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    // Get `app`, `method`, `params` and `result` from the hook context
    const {
      app,
      method,
      result,
      params
    } = context;

    // console.log(context.result)
    // console.log(`result:${context.result}`)
    const gameId = result.gameId;


    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const timeline = method === 'find' ? result.data : [result];

    // console.log(timeline)
    const metadataLookup = context.app.service('metadata').find({
      query: {
        gameId: gameId,
        $sort: {
          createdAt: -1
        },
        $limit: 1
      }
    });

    const gameSettingsLookup = context.app.service('game').find({
      query: {
        _id: gameId,
        $sort: {
          createdAt: 1
        },
        $limit: 1
      },
    });


    const waitForMetadataComputation = Promise.all([metadataLookup, gameSettingsLookup]).then((res) => {
      const lastMetadata = res[0][0]; // => { metadata: { remainingGameTime: n, ...}, gameId: xyz }
      const gameSettings = res[1][0];
      // console.log(`\n\nlastMetadata: ${JSON.stringify(res[0][0])} (${res[0].length})\n\n`)
      const initialMetadata = { metadata: gameStats.buildInitialMetadata(gameSettings) };
      const lmd = R.ifElse(R.isNil(), R.always(initialMetadata), R.identity())(lastMetadata);
      const metadata = gameStats.deriveMetadata(lmd.metadata, result);
      return metadata;
    });


    const waitForMetadataCreation = waitForMetadataComputation.then((thisMetadata) => {
      const wrappedMetadata = {
        metadata: thisMetadata,
        gameId: gameId
      };
      return context.app.service('metadata').create(wrappedMetadata)
    });


    waitForMetadataCreation.catch((e) => {
      console.error('Problem calculating metadata! See Error below.')
      console.error(e);
    });





    return context;

    // using the timeline event that was just created, compute the resulting metadata
    //const gameId = result.gameId;
    // context.app.service('metadata').find({
    //   query: {
    //     gameId: gameId
    //   }
    // }).then((lastMetadata) => {
    //   const thisMetadata = gameStats.calculateMetadata(lastMetadata, timeline);
    //   const wrappedMetadata = {
    //     metadata: thisMetadata,
    //     gameId: gameId
    //   };
    //   context.app.service('metadata').create(wrappedMetadata).then(() => {
    //     return context;
    //   });
    // });

  };
};
