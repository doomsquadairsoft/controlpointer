const NeDB = require('nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'events.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'device', unique: false });
  Model.ensureIndex({ fieldName: 'type', unique: false });
  Model.ensureIndex({ fieldName: 'captureProgress', unique: false })

  return Model;
};
