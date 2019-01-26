// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const R = require('ramda');
const h = require('./helpers');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        const gameLength = R.ifElse(
          R.allPass([h.isNumber, h.isLessThanOrEqOneWeek]), // 1 week max
          R.identity(),
          R.always(305500) // default to 5 minutes 55 seconds
        )(context.data.gameLength);

        const captureRate = R.ifElse(
            R.allPass([h.isNumber, h.isLessThanOrEq24Hours]), // 24 hours max
            R.identity(),
            R.always(5000) // default to 5 seconds
        )(context.data.captureRate);

        const gameName = R.ifElse(
            R.allPass([h.isSmall, h.isString, h.isntEmpty]),
            R.identity(),
            R.always(h.randomName())
        )(context.data.gameName);

        const includedDevices = R.ifElse(
            R.is(Array),
            R.identity(),
            R.always([])
        )(context.data.includedDevices);

        const gameMode = R.ifElse(
            R.allPass([h.isSectorControl]),
            R.identity(),
            R.always('sectorControl')
        )(context.data.gameMode);

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            gameLength,
            captureRate,
            gameName,
            gameMode,
            includedDevices,
            createdAt: new Date().getTime(),
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
