// Initializes the `messages` service on path `/messages`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./metadata.hooks');

module.exports = function (app) {

  const options = {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [ "createdAt", "gameId", "metadata", "metadata.theAnswer" ],
        properties: {
          createdAt: {
            bsonType: "int"
          },
          gameId: {
            bsonType: "string"
          },
          metadata: {
            bsonType: "array"
          },
          "metadata.theAnswer": {
            bsonType: "int"
          }
        }
      }
    }
  };

  MongoClient.connect(app.get('mongoUrl'), { useNewUrlParser: true }).then(client => {

    // Initialize our service with any options it requires
    app.use('/metadata', createService({
      Model: client.db('hqdb').collection('metadata', options)
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('metadata');

    service.hooks(hooks);
  });
};
