const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);



// Detect Ctrl+C, and wait a few seconds before closing
// the wait is to receive events from other things
process.on('SIGINT', function() {
    console.log("Caught interrupt signal. Exiting...");

    setTimeout( function() {
        process.exit();
    }, 3000);

});
