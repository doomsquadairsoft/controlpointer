// Initializes the `messages` service on path `/messages`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./devices.hooks');

module.exports = function (app) {

  const options = {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [ "name", "did", "createdAt", "latLng", "associatedGames" ],
        properties: {
          createdAt: {
            bsonType: "int"
          },
          did: {
            bsonType: "string"
          },
          latLng: {
            bsonType: "object"
          },
          "associatedGames": {
            bsonType: "array"
          }
        }
      }
    }
  };

  MongoClient.connect('mongodb://localhost:27017/feathers', { useNewUrlParser: true }).then(client => {
    // Initialize our service with any options it requires
    app.use('/devices', createService({
      Model: client.db('feathers').collection('devices', options)
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('devices');

    service.hooks(hooks);
  })
};
