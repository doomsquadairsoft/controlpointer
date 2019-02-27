// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const R = require('ramda');
const h = require('./helpers');
const defaults = require('../../src_shared/defaults');

module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return async context => {

    const type = R.ifElse(
      R.allPass([h.isntEmpty, h.isString, h.isSmall]),
      R.identity(),
      R.always(defaults.gameMode)
    )(context.data.type);

    const action = R.ifElse(
      R.allPass([h.isntEmpty, h.isString, h.isSmall]),
      R.identity(),
      R.always(defaults.unknown)
    )(context.data.action);

    const source = R.ifElse(
      R.allPass([h.isntEmpty, h.isString, h.isSmall]),
      R.identity(),
      R.always(defaults.unknown)
    )(context.data.source);

    const target = R.ifElse(
      R.allPass([h.isntEmpty, h.isString, h.isSmall]),
      R.identity(),
      R.always(defaults.unknown)
    )(context.data.target);

    const targetId = R.ifElse(
      R.allPass([h.isntEmpty, h.isString, h.isSmall]),
      R.identity(),
      R.always(defaults.unknown)
    )(context.data.targetId);

    const gameId = R.ifElse(
      R.allPass([h.isntEmpty, h.isString, h.isSmall]),
      R.identity(),
      R.always(defaults.unknown)
    )(context.data.gameId);


    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      type,
      action,
      source,
      target,
      targetId,
      gameId,
      createdAt: new Date().getTime()
    };

    // Best practise, hooks should always return the context
    return context;
  };
};
