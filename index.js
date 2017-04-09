var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Promise = require('bluebird');
var moment = require('moment');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var gameState = require('./state');
var path = require('path');
var timer = require('./timer');

app.use(cookieParser())
app.use(express.static('client_app'));



app.get('/livedata.json', function(req, res) {
    console.log('Cookies: ', req.cookies);
    res.json(gameState);
});

app.get('/qr', function(req, res) {
    var Handlebars = require('handlebars');
    fs.readFile(path.resolve('./templates/qr.hbs'), {'encoding': 'utf8'}, function(err, source) {
        if (err) return res.send(err);
        var context = gameState;
        var template = Handlebars.compile(source);
        res.send(template(context));
    });
});


function loadAbilitiesData(cb) {
    fs.readFile('./client_app/abilities.json', function(err, file) {
        if (err) {
            return cb('the abilities.json file was not readable.');
        }
        var data;
        try { 
            data = JSON.parse(file); 
        }
        catch(e) { 
            return cb('the abilities.json file did not contain valid JSON');
        }
        gameState.abilities = data;
        console.log('++ abilities data initialized from JSON!');
        console.log(gameState.abilities);
        return cb(null);
    });
}



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

        if (typeof data.controlPoints === 'undefined') {
            return cb('the cpdata.json file did not contain a capturePoints object. using default data.');
        }

        // set the game state using control point data
        gameState.controlPoints = data.controlPoints;

        // set timers using values in json file
        gameState.timers = data.timers;
        
        // for each control point, add some game state objects
        for (cp in gameState.controlPoints) {
            var c = gameState.controlPoints[cp];
            c.state = c.initialTeam;
            c.controllingTeam = null;
            c.capturedTime = null;
        }

        console.log('++ control point data initialized from JSON!');
        console.log(gameState.controlPoints);
        return cb(null);
        
    });
}

function loadClassData(cb) {
    fs.readFile('./client_app/classes.json', function(err, file) {
        if (err) {
            throw new Error('the classes.json file was not readable. BORKING!');
        }
        
        var data;
        try {
            data = JSON.parse(file);
        }
        catch(e) {
            throw new Error('the classes.json file did not contain valid JSON'+e);
        }
        gameState.classes = data;

        console.log('++ classes data initialized from JSON!');
        console.log(gameState.classes);
        return cb(null);

    })
}
    

function loadPlayerData(cb) {
    fs.readFile('./client_app/players.json', function(err, file) {
        if (err) {
            throw new Error('the players.json file was not readable. BORKING!');
        }

        var data;
        try {
            data = JSON.parse(file);
        }
        catch(e) {
            throw new Error('the players.json file did not contain valid JSON'+e);
        }
        if (typeof data.red === 'undefined') {
            throw new Error('the players.json file did not contain red player data');
        }
        if (typeof data.blu === 'undefined') {
            throw new Error('the players.json file did not contain blu player data');
        }
        gameState.players = data;

        // for each player, add an affiliation property
        for (pl in gameState.players.red)
            gameState.players.red[pl].affiliation = 'red';
        for (pl in gameState.players.blu)
            gameState.players.blu[pl].affiliation = 'blu';


        console.log('++ player data initialized from JSON!');
        console.log(gameState.players);
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
    if (err) console.error(err);
    loadPlayerData(function(err) {
        if (err) console.error(err);
        loadClassData(function(err) {
            if (err) console.error(err);
            loadAbilitiesData(function(err) {
                if (err) console.error(err);

                timer.start();
            
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
                
                http.listen(5000, function(){
                    console.log('listening on *:5000');
                });
                
                
                // API initialization
                var become = require('./become');
                var medic = require('./medic');
                var capture = require('./capture');
                become.api(app);
                medic.api(app, become);
                capture.api(app);
            });
        });
    });
});







