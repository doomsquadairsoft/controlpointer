// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const R = require('ramda');
const faker = require('faker');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        // greets https://stackoverflow.com/a/7228322/1004931
        const randomIntFromInterval = (min, max) => {
            return Math.floor(Math.random()*(max-min+1)+min);
        };
        const nameStr = `${faker.commerce.color()}-${randomIntFromInterval(1,50)}`;
        const randomName = () => R.toLower(nameStr);
        const isString = R.is(String);
        const isNumber = R.is(Number);
        const isSmall = R.compose(R.lte(R.__, 255), R.length());
        const isLessThanOrEqOneWeek = R.lte(R.__, 604800000);
        const isLessThanOrEq24Hours = R.lte(R.__, 86400000);
        const isntEmpty = R.compose(R.not(), R.isEmpty());
        const isSectorControl = R.equals('sectorControl');

        const gameLength = R.ifElse(
          R.allPass([isNumber, isLessThanOrEqOneWeek]), // 1 week max
          R.identity(),
          R.always(305500) // default to 5 minutes 55 seconds
        )(context.data.gameLength);

        const captureRate = R.ifElse(
            R.allPass([isNumber, isLessThanOrEq24Hours]), // 24 hours max
            R.identity(),
            R.always(5000) // default to 5 seconds
        )(context.data.captureRate);

        const gameName = R.ifElse(
            R.allPass([isSmall, isString, isntEmpty]),
            R.identity(),
            R.always(randomName())
        )(context.data.gameName);

        const includedDevices = R.ifElse(
            R.is(Array),
            R.identity(),
            R.always([])
        )(context.data.includedDevices);
        console.log(`includedDevices:${context.data.includedDevices} typeof:${R.type(context.data.includedDevices)}`)

        const gameMode = R.ifElse(
            R.allPass([isSectorControl]),
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
