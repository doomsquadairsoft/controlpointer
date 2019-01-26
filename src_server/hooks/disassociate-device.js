// Associate a D3VICE with a game by adding the gameId to device.associatedGame
// Meant to be called as a create hook to game

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


    const gameId = result.gameId;
    const includedDevices = result.includedDevices;
    console.log(result);
    console.log(`creating game ${gameId}. The game's associated devices are:${includedDevices}`)

    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const timeline = method === 'find' ? result.data : [result];

    const deviceLookup = context.app.service('devices').find({
      query: {
        gameId: gameId
      },
      $sort: {
        createdAt: 1
      }
    });

    const gameSettingsLookup = context.app.service('game').find({
      query: {
        _id: gameId
      },
      $sort: {
        createdAt: 1
      },
      $limit: 1
    });


    const waitForMetadataComputation = Promise.all([metadataLookup, gameSettingsLookup]).then((res) => {
      const lastMetadata = res[0][0]; // => { metadata: { remainingGameTime: n, ...}, gameId: xyz }
      const gameSettings = res[1][0];
      const initialMetadata = { metadata: gameStats.buildInitialMetadata(gameSettings) };
      const lmd = R.ifElse(R.isNil(), R.always(initialMetadata),R.identity())(lastMetadata);
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

  };
};
