// Capture subsystem

// when the game starts, players scan a QR code on their ID card which gives their phone a cookie.
// later, when players scan a QR code at a control point, they visit a link on their phone to the /capture endpoint.
// using the cookie to determine the player's team affiliation, interact with the capture point game state.



var _ = require('lodash');
var gameState = require('./state');
var become = require('./become');
var errors = require('./errors');



var middlewareCapmantle = function middlewareCapmantle(req, res) {
    capmantle(req.controlpointer.controlPoint, req.controlpointer.affiliation, req.controlpointer.player)
        .then(function(result) {
            return res.send(result);
        })
        .catch(function(err) {
            return res.send(err);
        });
}                                                                                                      


/**
* setAction
*
*   - sets the action variable in req.controlpointer
*     which is used by become.authenticate
*     to determine if a player is allowed to complete this action
*/
var setAction = function setAction(req, res, next) {

    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    req.controlpointer.action = 'capmantle';

    return next();

};



/**
 * setPlayer
 *
 * using the 
 */
var setPlayer = function setPlayer(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    
}




var setAuth = function setAuth(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    if (typeof req.cookie.auth === 'undefined')
        return res.send('You are not authorized. Have you registered as an in-game identity?');

    req.controlpointer.auth = req.cookie.auth
};


var setPlayerFromCookie = function setPlayerFromCookie(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    if (typeof req.controlpointer.auth === 'undefined')
        return res.send("no auth exists on the controlpointer object.");


};



/**
 * setAffiliation
 *
 * sets affiliation var in req.controlpointer
 */
var setAffiliation = function setAffiliation(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    if (typeof req.query.affiliation === 'undefined')
        throw new Error('AFFILIATION was missing from the query parameters! Did you scan a QR code?');

    req.controlpointer.affiliation = req.query.affiliation;
    next();
}


set

/**
* setControlPoint
*
*   - inserts controlPoint variable into req.controlpointer
*     used later on in this middleware chain in the middlewareCapmantle middleware
*/
var setControlPoint = function setControlPoint(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;
    
    if (typeof req.query.cp === 'undefined')
        return res.send('No controlpoint (cp) was in the querystring. did you scan the correct QR code?');

    req.controlpointer.controlPoint = req.query.cp;

    next();
};



module.exports.api = function api(app) {
    app.get('/capture', become.init, setAction, setControlPoint, become.authorize, middlewareCapmantle);
}


module.exports.validateStateChange = function validateStateChange(oldState, reportedState) {
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


module.exports.updateState = function updateState(controlPoint, reportedState) {
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


var capmantle = module.exports.capmantle = function capmantle(controlPoint, team, player) {
    return new Promise(function (resolve, reject) {
        
        // make sure controlpoint exists in game state
        if (typeof gameState.controlPoints[controlPoint] === 'undefined')
            return reject('The controlpoint the client claims to have captured does not exist in the game!');

        // make sure team exists in game state
        console.log('>capture ::::: checking team %s', team);
        if (typeof gameState.teams[team] === 'undefined')
            return reject('The team the client claims to belong to does not exist in the game!');

        // make sure this is a valid capture (must satisfy game-wide capture conditions)
        // @todo

        // if the capmantle was initiated by a player rather than an admin,
        // credit the player for the capture/dismantle attempt.
        if (typeof player !== 'undefined') {
            var affiliation = player.affiliation;
            var firstName = player.firstName;
            var lastName = player.lastName;
            console.log('player %s %s (%s) is capturing/dismantling point %s', firstName, lastName, player.id, controlPoint);
            
            // exit if affiliation could not be determined, or was something other than red or blu
            if (typeof affiliation === 'undefined' || (affiliation !== 'red' && affiliation !== 'blu')) return reject('player affiliation was not recognized');
            
            // increment this player's capmantle count
            if (typeof player.capmantleCount === 'undefined') player.capmantleCount = 1;
            else player.capmantleCount += 1;
        }
        
        
        // set new game state
        var captureTime = moment();
        gameState.controlPoints[controlPoint].controllingTeam = team;
        gameState.controlPoints[controlPoint].capturedTime = captureTime;

        return resolve({'controlPoint': controlPoint, 'team': team, 'captureTime': captureTime, 'player': player});
    });
}


module.exports.checkWinConditions = function checkWinConditions(controlPoint, team, captureTime) {

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



module.exports.endGame = function endGame(controlPoint, team, captureTime, message) {
    var gameDurationMilliseconds = captureTime.diff(gameState.gameStartTime, 'milliseconds');
    var gameDurationSeconds = gameDurationMilliseconds / 1000;
    var gameDurationMinutes = gameDurationSeconds / 60;
    var gameDurationHours = gameDurationMinutes / 60;
    var gameDuration = ''+parseInt(gameDurationHours)+':'+parseInt(gameDurationMinutes)+':'+parseInt(gameDurationSeconds);

    console.log('Game duration was '+gameDuration);
    gameState.gameStopTime = moment();
}


