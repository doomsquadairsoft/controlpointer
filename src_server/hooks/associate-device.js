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


    const gameId = result._id;
    const includedDevices = result.includedDevices;
    console.log(result);
    console.log(`creating game ${gameId}. The game's associated devices are:${includedDevices}`);

    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const timeline = method === 'find' ? result.data : [result];

    const associate = (iDevId) => {
      return context.app.service('devices').patch(iDevId, {
        associatedGame: gameId
      });
    };

    const waitForAssociation = Promise.each(includedDevices, associate);

    waitForAssociation.catch((e) => {
      console.error('Problem associating device! See Error below.')
      console.error(e);
    });


    return context;

  };
};
