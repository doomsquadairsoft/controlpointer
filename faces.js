#!/Users/lol/.nvm/versions/node/v4.5.0/bin/node

var os = require('os');
var path = require('path');
var phantomExe = path.join(os.homedir(), 'phantom', 'bin', 'phantom');
// generate a face using Phantomjs

child_process.spawn(phantomExe, ['./face.js']);


