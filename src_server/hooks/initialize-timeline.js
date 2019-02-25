// Create a game creation timeline event.


const gameStats = require('../../src_shared/gameStats');
const Promise = require('bluebird');
const R = require('ramda');
const defaults = require('../../src_shared/defaults');

module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return async (context) => {
    // Get `app`, `method`, `params` and `result` from the hook context
    const {
      app,
      method,
      result,
      params
    } = context;

    // get handle on game
    // get handle on game.includedDevices
    // get handle on metadata
    // create metadata with devicesProgress defined from game.includedDevices


    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    // const game = method === 'find' ? result.data : [result];

    // const gameId = result._id;
    // const includedDevices = result.includedDevices;

    const game = context.result;
    const includedDevices = game.includedDevices;
    const metadata = app.service('metadata');
    const gameId = game._id.toString();

    const creationEvent = {
      action: 'create',
      createdAt: new Date().getTime(),
      gameId: gameId,
      source: 'admin',
      target: 'game',
      targetId: defaults.unknown,
      type: 'timeline'
    };

    // console.log(context);
    console.log(`gameId:${JSON.stringify(gameId)} type:${R.type(gameId)} converted:${R.type(JSON.stringify(gameId))}`)
    console.log(`  🐱 typeOf gameId: ${R.type(gameId)} creationEvent:${JSON.stringify(creationEvent)}`)

    const initialize = (evt) => {
      return context.app.service('timeline').create(evt);
    };

    initialize(creationEvent)
    .then((idk) => {
      //   return context.app.service('devices').update(deviceId, alteredDevice);
      console.log(`  ✈️ Game timeline initialized!`);
      console.log(idk);
    })
    .catch((e) => {
      console.log(e);
    })

    //
    // console.log(`  🆕 [HOOK] Populating devicesProgress. context:${JSON.stringify(context)}`);
    // console.log(`  🇳🇨 includedDevices: ${JSON.stringify(context.data.includedDevices)}`)

    // const deviceLookup = async (deviceId) => {
    //   const d = await context.app.service('devices').find({
    //     query: {
    //       _id: deviceId
    //     }
    //   });
    //   return d[0];
    // }

    // const alterDevice = (device, idx) => {
    //   console.log(`altering ${device.name}, idx:${idx}`)
    //   const associatedGameLens = R.lensProp('associatedGames');
    //   const appendAndEnsureUniq = R.compose(R.uniq(), R.append(gameId));
    //   const updatedAssociatedGame = R.over(associatedGameLens, appendAndEnsureUniq, device);
    //   return updatedAssociatedGame;
    // };
    //
    // const commitDevice = (alteredDevice) => {
    //   const deviceId = alteredDevice._id;
    //   console.log(`updatedDevice:${JSON.stringify(alteredDevice)}  deviceId:${deviceId}`)
    //   return context.app.service('devices').update(deviceId, alteredDevice);
    // };
    //
    //
    //
    //
    // const devices = await Promise.map(includedDevices, deviceLookup);
    // console.log(`devices:${devices}`)
    // console.log(devices)
    // const alteredDevices = await Promise.map(devices, alterDevice);
    // console.log(`alteredDevices:${alteredDevices}`)
    // console.log(alteredDevices)
    // const res = await Promise.map(alteredDevices, commitDevice);
    // console.log(`the results are in!`)
    // console.log(res);
    // console.log(`done.`)


    return context;

  };
};
