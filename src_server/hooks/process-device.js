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

    const name = R.ifElse(
      R.allPass([h.isString, h.isSmall]),
      R.identity(),
      R.always(h.randomName())
    )(context.data.name);

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

    const associatedGame = R.ifElse(
      R.allPass([h.isString, h.isSmall]),
      R.identity(),
      R.always()
    )(context.data.associatedGame);


    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      name,
      did,
      latLng,
      redProgress,
      bluProgress,
      associatedGame,
      createdAt: new Date().getTime()
    };

    // Best practise, hooks should always return the context
    return context;
  };
};
