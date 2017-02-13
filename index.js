var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Promise = require('bluebird');
var moment = require('moment');


app.use(express.static('client_app'));


var gameState = {
    'gameStartTime': moment(),
    'teams': {
        'red': true,
        'blu': true
    },
    'controlPoints': {
        'town': {
            'controllingTeam': 'blu',
            'capturedTime': this.gameStartTime
        },
        'tower': {
            'controllingTeam': 'red',
            'capturedTime': this.gameStartTime
        },
        'firePit': {
            'controllingTeam': null,
            'capturedTime': null
        },
        'bridge': {
            'controllingTeam': null,
            'capturedTime': null
        }
    }
};

function capture(controlPoint, team) {
    return new Promise(function (resolve, reject) {
        
        // make sure controlpoint exists in game state
        if (typeof gameState.controlPoints[controlPoint] === 'undefined')
            return reject('The controlpoint the client claims to have captured does not exist in the game!');

        // make sure team exists in game state
        if (typeof gameState.teams[team] === 'undefined')
            return reject('The team the client claims to belong to does not exist in the game!');

        // make sure this is a valid capture (must satisfy game-wide capture conditions)
        // @todo
        
        // set new game state
        var captureTime = moment();
        gameState.controlPoints[controlPoint].controllingTeam = team;
        gameState.controlPoints[controlPoint].capturedTime = captureTime;

        return resolve({'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime});
    });
}


function checkWinConditions(controlPoint, team, captureTime) {

    return new Promise(function(resolve, reject) {

        
        // if BLU controls all points, BLU wins
        if (
            gameState.controlPoints.town.controllingTeam === 'blu' &&
            gameState.controlPoints.tower.controllingTeam === 'blu' &&
            gameState.controlPoints.firePit.controllingTeam === 'blu' &&
            gameState.controlPoints.bridge.controllingTeam === 'blu'                                                  
        ) {
            var message = 'BLU team wins the game by capturing '+controlPoint+' and all other points.'
            return resolve({'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime, 'message': message});
        }

        
        // if RED controlls all points, RED wins.
        if (
            gameState.controlPoints.town.controllingTeam === 'red' &&
            gameState.controlPoints.tower.controllingTeam === 'red' &&
            gameState.controlPoints.firePit.controllingTeam === 'red' &&
            gameState.controlPoints.bridge.controllingTeam === 'red'
        ) {
            var message = 'RED team wins the game by capturing '+controlPoint+' and all other points.';
            return resolve({'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime, 'message': message});
        }

        return reject('no win condition was satisfied.');
    })

        
}



function endGame(controlPoint, team, captureTime, message) {
    var gameDurationMilliseconds = captureTime.diff(gameState.gameStartTime, 'milliseconds');
    var gameDurationSeconds = gameDurationMilliseconds / 1000;
    var gameDurationMinutes = gameDurationSeconds / 60;
    var gameDurationHours = gameDurationMinutes / 60;
    var gameDuration = ''+parseInt(gameDurationHours)+':'+parseInt(gameDurationMinutes)+':'+parseInt(gameDurationSeconds);

    console.log('Game duration was '+gameDuration);
    gameState.gameStopTime = moment();
}


io.on('connection', function(socket){
    console.log('a user connected');
    
    socket.on('capture', function(data) {
        console.log('capture report received');
        console.log(data);
        var controlPoint = data.controlPoint;
        var team = data.team;
        capture(controlPoint, team)
            .then(function(result) {
                var controlPoint = result.controlPoint;
                var team = result.team;
                var captureTime = result.captureTime;
                console.log('control point %s captured by team %s at %s', controlPoint, team, captureTime.format());
                io.emit('update', {'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime});
                
                // check win conditions
                checkWinConditions(controlPoint, team, captureTime)
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

http.listen(3000, function(){
    console.log('listening on *:3000');
});


