const NeDB = require('nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'metadata.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'createdAt', unique: false });
  Model.ensureIndex({ fieldName: 'gameId', unique: false });
  Model.ensureIndex({ fieldName: 'metadata', unique: false });

  return Model;
};
