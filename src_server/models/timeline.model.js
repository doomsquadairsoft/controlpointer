const NeDB = require('nedb');
const path = require('path');

console.log('|||||||||||| timeline.model.js checking in!')

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'timeline.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'type', unique: false });
  Model.ensureIndex({ fieldName: 'action', unique: false });
  Model.ensureIndex({ fieldName: 'createdAt', unique: false });

  return Model;
};
