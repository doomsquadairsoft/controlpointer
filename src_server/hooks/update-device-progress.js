// Update device progress based on the metadata.
// Meant to be called as a create hook to metadata

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
    const metadata = method === 'find' ? result.data : [result];

    const md = metadata[0].metadata;
    const includedDevices = R.pluck('targetId', md.devicesProgress);

    const updateDevice = (deviceId) => {
      const device = R.find(R.propEq('targetId', deviceId), md.devicesProgress);
      return context.app.service('devices').patch(deviceId, {
        redProgress: device.red,
        bluProgress: device.blu
      });
    };

    Promise.each(includedDevices, updateDevice).catch((e) => {
      console.log('there was a problem while updating devices see error below.');
      console.log(e);
    })


    return context;

  };
};
