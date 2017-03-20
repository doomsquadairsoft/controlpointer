var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Promise = require('bluebird');
var moment = require('moment');
var fs = require('fs');


app.use(express.static('client_app'));



var gameState = {
    'gameStartTime': moment(),
    'teams': {
        'red': true,
        'blu': true
    },
    /* 'controlPoints': {}
     *     'town': {
     *         'controllingTeam': 'blu',
     *         'capturedTime': this.gameStartTime
     *     },
     *     'tower': {
     *         'controllingTeam': 'red',
     *         'capturedTime': this.gameStartTime
     *     },
     *     'firePit': {
     *         'controllingTeam': null,
     *         'capturedTime': null
     *     },
     *     'bridge': {
     *         'controllingTeam': null,
     *         'capturedTime': null
     *     }*/
    //}
};


function loadControlPointData(cb) {
    fs.readFile('./client_app/cpdata.json', function(err, file) {
        if (err) {
            return cb('the cpdata.json file was not readable. using default data.');
        }
        
        var data;
        try {
            data = JSON.parse(file);
        }
        catch(e) {
            return cb('the cpdata.json file did not contain valid JSON. using default data.');;
        }

        if (typeof data.capture_points === 'undefined') {
            return cb('the cpdata.json file did not contain a capture_points object. using default data.');
        }

        // set the game state using control point data
        gameState.controlPoints = data.capture_points;
        
        // for each control point, add some game state objects
        for (cp in gameState.controlPoints) {
            gameState.controlPoints[cp].state = null;
            gameState.controlPoints[cp].controllingTeam = null;
            gameState.controlPoints[cp].capturedTime = null;
        }

        console.log('game state initialized from JSON!');
        console.log(gameState.controlPoints);
        return cb(null);
        
    });
}

function validateStateChange(oldState, reportedState) {
    return new Promise(function (resolve, reject) {
        var possibleStates = [
            'red', // RED, uncontested
            'blu', // BLU, uncontested
            'unk', // UNCAPTURED
            'dbl', // BLU, dismantling
            'dre', // RED, dismantling
            'fdb', // BLU, fast dismantling
            'fdr', // RED, fast dismantling
            'cbl', // BLU, capturing
            'cre', // RED, capturing
            'fcb', // BLU, fast capturing
            'fcr', // RED, fast capturing
        ];

        if (oldState === null) oldState = 'unk';

        // UNCAPTURED can change to 'BLU, capturing', 'BLU, fast capturing', 'RED, capturing', or 'RED, fast capturing'
        if (oldState === 'unk') {
            if (reportedState === 'cbl' || reportedState === 'cre' || reportedState === 'fcb' || reportedState === 'fcr')
                resolve(reportedState);
            else
                reject("UNCAPTURED must change to 'BLU, capturing', 'BLU, fast capturing', 'RED, capturing', or 'RED, fast capturing'.");
        }
                    
        // 'BLU, uncontested' can change to 'BLU, dismantling', or 'BLU, fast dismantling'
        if (oldState === 'blu') {
            if (reportedState === 'dbl' || reportedState === 'fdb')
                resolve(reportedState);
            else 
                reject("BLU must change to 'BLU, dismantling', or 'BLU, fast dismantling'");
        }

        // 'RED, uncontested' can change to 'RED, dismantling', or 'RED, fast dismantling'
        if (oldState === 'red') {
            if (reportedState === 'dre' || reportedState === 'fdr')
                resolve(reportedState);
            else
                reject("RED must change to 'RED, dismantling', or 'RED, fast dismantling'");
        }


        // 'BLU, dismantling' can change to 'BLU, uncontested', or UNCAPTURED
        if (oldState === 'dbl') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'BLU, dismantling' must change to 'BLU, uncontested', or 'UNCAPTURED'");
        }

        // 'RED, dismantling' can change to 'RED, uncontested', or UNCAPTURED
        if (oldState === 'dre') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'RED, dismantling' must change to 'RED, uncontested', or 'UNCAPTURED'");
        }

        // 'BLU, fast dismantling' can change to 'BLU, uncontested', or UNCAPTURED
        if (oldState === 'fdb') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'BLU, fast dismantling' must change to 'BLU, uncontested', or 'UNCAPTURED'");
        }

        // 'RED, fast dismantling' can change to 'RED, uncontested', or UNCAPTURED
        if (oldState === 'fdr') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'RED, fast dismantling' must change to 'RED, uncontested', or 'UNCAPTURED'");
        }


        // 'BLU, capturing' can change to 'BLU, uncontested', or 'UNCAPTURED'
        if (oldState === 'cbl') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'BLU, capturing' must change to 'BLU, uncontested' or UNCAPTURED");
        }


        // 'RED, capturing' can change to 'RED, uncontested', or 'UNCAPTURED'
        if (oldState === 'cre') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'RED, capturing' must change to 'RED, uncontested' or UNCAPTURED");
        }


        // 'BLU, fast capturing' can change to 'BLU, uncontested', or 'UNCAPTURED'
        if (oldState === 'fcb') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'BLU, fast capturing' must change to 'BLU, uncontested' or UNCAPTURED");
        }


        // 'RED, fast capturing' can change to 'RED, uncontested', or 'UNCAPTURED'
        if (oldState === 'fcr') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                reject("'RED, fast capturing' must change to 'RED, uncontested' or UNCAPTURED");
        }

        reject("oldState "+oldState+" is not a valid state. (reportedState="+reportedState+")");
        
    })
}


function updateState(controlPoint, reportedState) {
    return new Promise(function (resolve, reject) {

        // make sure controlpoint exists in game state
        if (typeof gameState.controlPoints[controlPoint] === 'undefined')
            return reject('The controlpoint the client claims to have updated does not exist in the game!');
        
        // validate that the state change is allowed according to the game's rules
        return validateStateChange(gameState.controlPoints[controlPoint].state, reportedState)
            .then(function(newState) {
                console.log('validated. changing to state %s', newState);
                gameState.controlPoints[controlPoint].state = newState;

                gameState.controlPoints[controlPoint].updateTime = moment();
                console.log(gameState.controlPoints[controlPoint]);


                resolve(gameState.controlPoints[controlPoint]);
            })
    })
}


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



loadControlPointData(function(err) {

    if (err) {
        console.error(err);
    }

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
            
            return updateState(controlPoint, state)
                .then(function(result) {
                    var controlPoint = result.controlPoint;
                    var state = result.state
                    var updateTime = result.updateTime;
                    
                    console.log('control point %s changed to state %s at %s', controlPoint, state, updateTime.format());
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

});


