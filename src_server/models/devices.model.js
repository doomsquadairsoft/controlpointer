const NeDB = require('nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'devices.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'did', unique: true });
  Model.ensureIndex({ fieldName: 'latLng', unique: false });
  Model.ensureIndex({ fieldName: 'controllingTeam', unique: false });
  Model.ensureIndex({ fieldName: 'redProgress', unique: false });
  Model.ensureIndex({ fieldName: 'bluProgress', unique: false })

  return Model;
};
