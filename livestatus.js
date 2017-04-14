var gameState = require('./state');


module.exports = function liveStatus(http) {

    var io = require('socket.io')(http);


    io.on('connection', function(socket){
        console.log('a user connected');
        
        socket.on('querystate', function(data) {
            io.emit('state', { state: gameState });
        });
        
        socket.on('sitrep', function(data) {
            console.log('state update report received');
            console.log(data);
            
            var controlPoint, state;
            typeof data.controlPoint === 'undefined' ? controlPoint = null : controlPoint = data.controlPoint;
            typeof data.state === 'undefined' ? state = null : state = data.state;
            
            return capture.updateState(controlPoint, state)
                .then(function(result) {
                    var controlPoint = result.controlPoint;
                    var state = result.state
                    var updateTime = result.updateTime;
                    
                    console.log('INDEX:: control point %s changed to state %s at %s', controlPoint, state, updateTime.format());
                    io.emit('state', gameState);
                    
                    //checkWinConditions(controlPoint, , updateTime)
                    //.then(function(res) {
                    //    endGame(res.controlPoint, res.team, res.updateTime, res.message);
                    //})
                    //.catch(function(reason) {
                    //    console.log('no win condition satisfied. reason is "%s"', reason);
                    //});
                })
                .catch(function(reason) {
                    console.log('no state change condition satisfied. reason is "%s"', reason);
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
                    io.emit('update', {'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime});
                    
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
