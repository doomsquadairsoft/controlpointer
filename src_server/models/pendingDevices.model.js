const NeDB = require('nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'pendingDevices.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'did', unique: true });
  Model.ensureIndex({ fieldName: 'latLng', unique: false });

  return Model;
};
