var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var liveStatus = require('./livestatus')(io);
var Promise = require('bluebird');
var moment = require('moment');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var gameState = require('./state');
var path = require('path');
var timer = require('./timer');
var save = require('./save');


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
            c.direction = null;
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


                liveStatus.start();
                timer.start(liveStatus);
                
                
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







