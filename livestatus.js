var gameState = require('./state');
var radio = require('radio');
var capture = require('./capture');



module.exports = LiveStatus;

function LiveStatus(io) {
    if (!(this instanceof LiveStatus)) return new LiveStatus(io);
    this.io = io;
}


LiveStatus.prototype.start = function start() {
    var self = this;

    // when receiving a radio message telling us to update the client map, update the client map.
    radio('update').subscribe(function update() {
        console.log('>> received radio transmission UPDATE');
        self.io.emit('state', gameState);
    });

    self.io.on('connection', function(socket){
        console.log('a user connected');
        
        // send up-to-date map data to new connections
        socket.emit('state', gameState);
        
        socket.on('querystate', function(data) {
            self.io.to('/').emit('state', gameState );
        });
        
        socket.on('sitrep', function(data) {
            console.log('state update report received');
            console.log(data);
            
            var controlPoint, state;
            typeof data.controlPoint === 'undefined' ? controlPoint = null : controlPoint = data.controlPoint;
            typeof data.state === 'undefined' ? state = null : state = data.state;
            
            capture.adminAbsolute(controlPoint, state)
                .then(function(result) {
                    console.log('livestatus::sitrep control point %s changed to state %s', controlPoint, state);
                })
                .catch(function(reason) {
                    console.log('livestatus::sitrep error. no state change condition satisfied. reason is "%s"', reason);
                });
        });
	
        socket.on('capture', function(data) {
            console.log('capture report received');
            console.log(data);
            var controlPoint = data.controlPoint;
            var team = data.team;
            capture.capmantle(controlPoint, team)
                .then(function(result) {
                    var controlPoint = result.controlPoint;
                    var team = result.team;
                    var captureTime = result.captureTime;
                    console.log('control point %s captured by team %s at %s', controlPoint, team, captureTime.format());
                    self.io.emit('update', {'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime});
                    
                    // check win conditions
                    capture.checkWinConditions(controlPoint, team, captureTime)
                        .then(function(res) {
                            endGame(res.controlPoint, res.team, res.captureTime, res.message);
                        })
                        .catch(function(reason) {
                            console.log('no win condition satisfied. reason is "%s"', reason);
                        });
                })
                .catch(function(reason) {
                    console.log('no capture condition satisfied. reason is "%s"', reason);
                });
        });
        
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });
};

