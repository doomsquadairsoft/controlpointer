const NeDB = require('nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'game.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'gameLength', unique: false });
  Model.ensureIndex({ fieldName: 'captureRate', unique: false });
  Model.ensureIndex({ fieldName: 'includedDevices', unique: false });
  Model.ensureIndex({ fieldName: 'createdAt', unique: false });
  Model.ensureIndex({ fieldName: 'gameName', unique: false });

  return Model;
};
