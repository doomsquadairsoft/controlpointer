// the hook that fires when a new device is created. Validates user input.

const R = require('ramda');
const h = require('./helpers');
const defaults = require('../../src_shared/defaults');

module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    const {
      data
    } = context;

    const did = R.ifElse(
      R.allPass([h.isString, h.isSmall]),
      R.identity(),
      R.always(h.randomName())
    )(context.data.did);

    const description = R.ifElse(
      R.allPass([h.isSmall, h.isString, h.isntEmpty]),
      R.identity(),
      R.always('Generic description')
    )(context.data.description);

    const latLng = R.ifElse(
      R.allPass([h.isObject]),
      R.identity(),
      R.always(defaults.latLng)
    )(context.data.latLng);

    const redProgress = R.ifElse(
      R.allPass([h.isNumber, h.isLte100, h.isGte0]),
      R.identity(),
      R.always(0)
    )(context.data.redProgress);

    const bluProgress = R.ifElse(
      R.allPass([h.isNumber, h.isLte100, h.isGte0]),
      R.identity(),
      R.always(0)
    )(context.data.bluProgress);

    const associatedGames = R.ifElse(
      R.allPass([h.isArray, h.isSmall]),
      R.identity(),
      R.always([])
    )(context.data.associatedGames);

    const address64 = R.ifElse(
      R.allPass([h.isString, h.isLength16]),
      R.identity(),
      R.always('UNVALIDs')
    )(context.data.address64);

    const rssi = R.ifElse(
      R.allPass([h.isNumber]),
      R.identity(),
      R.always(undefined)
    )(context.data.rssi);

    const batt = R.ifElse(
      R.allPass([h.isNumber]),
      R.identity(),
      R.always(undefined)
    )(context.data.batt);

    const type = R.ifElse(
      R.allPass([h.isString, h.isDeviceType]),
      R.identity(),
      R.always(defaults.deviceType)
    )(context.data.type);

    const xbeeUpdatedAt = R.ifElse(
      R.allPass([]),
      R.identity(),
      R.always(defaults.xbeeUpdatedAt)
    )(context.data.xbeeUpdatedAt);

    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      did,
      rssi,
      batt,
      latLng,
      address64,
      description,
      redProgress,
      bluProgress,
      associatedGames,
      xbeeUpdatedAt,
      createdAt: new Date().getTime()
    };

    // Best practise, hooks should always return the context
    return context;
  };
};
