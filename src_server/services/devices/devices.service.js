// Initializes the `messages` service on path `/messages`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./devices.hooks');

module.exports = function (app) {

  const options = {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [ "did", "createdAt", "latLng", "associatedGames", "type" ],
        properties: {
          "description": {
            bsonType: "string"
          },
          "createdAt": {
            bsonType: "int"
          },
          "did": {
            bsonType: "string"
          },
          "latLng": {
            bsonType: "object"
          },
          "associatedGames": {
            bsonType: "array"
          },
          "address64": {
            bsonType: "string"
          },
          "rssi": {
            bsonType: "int"
          },
          "batt": {
            bsonType: "decimal"
          },
          "type": {
            bsonType: "string"
          }
        }
      }
    }
  };

  MongoClient.connect(app.get('mongoUrl'), { useNewUrlParser: true }).then(client => {
    // Initialize our service with any options it requires
    app.use('/devices', createService({
      Model: client.db('hqdb').collection('devices', options)
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('devices');

    service.hooks(hooks);
  })
};
