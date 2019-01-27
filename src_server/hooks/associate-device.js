// Associate a D3VICE with a game by adding the gameId to device.associatedGame
// Meant to be called as a create hook to game

const gameStats = require('../../src_shared/gameStats');
const Promise = require('bluebird');
const R = require('ramda');

module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return async (context) => {
    // Get `app`, `method`, `params` and `result` from the hook context
    const {
      app,
      method,
      result,
      params
    } = context;


    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const device = method === 'find' ? result.data : [result];

    const gameId = result._id;
    const includedDevices = result.includedDevices;
    console.log(result);
    console.log(`creating game ${gameId}. The game's associated devices are:${includedDevices}`);


    const deviceLookup = async (deviceId) => {
      const d = await context.app.service('devices').find({
        query: {
          _id: deviceId
        }
      });
      return d[0];
    }

    const alterDevice = (device, idx) => {
      console.log(`altering ${device.name}, idx:${idx}`)
      const associatedGameLens = R.lensProp('associatedGames');
      const appendAndEnsureUniq = R.compose(R.uniq(), R.append(gameId));
      const updatedAssociatedGame = R.over(associatedGameLens, appendAndEnsureUniq, device);
      return updatedAssociatedGame;
    };

    const commitDevice = (alteredDevice) => {
      const deviceId = alteredDevice._id;
      console.log(`updatedDevice:${JSON.stringify(alteredDevice)}  deviceId:${deviceId}`)
      return context.app.service('devices').update(deviceId, alteredDevice);
    };




    const devices = await Promise.map(includedDevices, deviceLookup);
    console.log(`devices:${devices}`)
    console.log(devices)
    const alteredDevices = await Promise.map(devices, alterDevice);
    console.log(`alteredDevices:${alteredDevices}`)
    console.log(alteredDevices)
    const res = await Promise.map(alteredDevices, commitDevice);
    console.log(`the results are in!`)
    console.log(res);
    console.log(`done.`)


    return context;

  };
};
