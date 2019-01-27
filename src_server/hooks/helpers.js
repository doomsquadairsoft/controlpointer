const R = require('ramda');
const faker = require('faker');


// greets https://stackoverflow.com/a/7228322/1004931

const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random()*(max-min+1)+min);
};

const nameStr = () => `${faker.random.word()}-${randomIntFromInterval(1,50)}`;
const colorStr = () => `${faker.commerce.color()}-${randomIntFromInterval(1,50)}`;
const normalize = R.compose(R.toLower(), R.replace(/\s/g, '-'));
const randomName = () => normalize(nameStr());
const randomColorName = () => normalize(colorStr());
const isString = R.is(String);
const isArray = R.is(Array);
const isNumber = R.is(Number);
const isObject = R.is(Object);
const isSmall = R.compose(R.lte(R.__, 255), R.length());
const isLessThanOrEqOneWeek = R.lte(R.__, 604800000);
const isLessThanOrEq24Hours = R.lte(R.__, 86400000);
const isntEmpty = R.compose(R.not(), R.isEmpty());
const isSectorControl = R.equals('sectorControl');
const isGte0 = R.gte(R.__, 0);
const isLte100 = R.lte(R.__, 100);


module.exports = {
  randomIntFromInterval,
  nameStr,
  colorStr,
  randomName,
  randomColorName,
  isObject,
  isArray,
  isString,
  isNumber,
  isSmall,
  isLessThanOrEq24Hours,
  isLessThanOrEqOneWeek,
  isntEmpty,
  isSectorControl,
  isGte0,
  isLte100,
}
