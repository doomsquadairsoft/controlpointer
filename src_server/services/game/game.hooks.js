//const { authenticate } = require('@feathersjs/authentication').hooks;
const processGame = require('../../hooks/process-game');
const populateGame = require('../../hooks/populate-game');
const associateDevice = require('../../hooks/associate-device');
const disassociateDevice = require('../../hooks/disassociate-device');
const initializeTimeline = require('../../hooks/initialize-timeline');

module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [processGame()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populateGame()],
    get: [],
    create: [associateDevice(), initializeTimeline()],
    update: [],
    patch: [],
    remove: [disassociateDevice()]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
