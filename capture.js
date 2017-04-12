// Capture subsystem

// when the game starts, players scan a QR code on their ID card which gives their phone a cookie.
// later, when players scan a QR code at a control point, they visit a link on their phone to the /capture endpoint.
// using the cookie to determine the player's team affiliation, interact with the capture point game state.



var _ = require('lodash');
var gameState = require('./state');
var become = require('./become');
var errors = require('./errors');
var moment = require('moment');
var Promise = require('bluebird');


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


var stateAdvanceMid = function stateAdvanceMid(req, res, next) {
    console.log('capture::stateAdvanceMid');

    advance(req.controlpointer.controlPoint, req.controlpointer.player)
        .then(function(result) {
            console.log('capture::stateAdvanceMid::THEN!!!!! state advance middleware complete with data %s', result);
            res.send(result);
        })

};


var middlewareCapmantle = function middlewareCapmantle(req, res) {
    capmantle(req.controlpointer.controlPoint, req.controlpointer.player.affiliation, req.controlpointer.player)
        .then(function(result) {
            console.log('middleware capmantle complete with data %s', result);
            
            console.log(result);
            return res.send(result);
        })
        .catch(function(err) {
            console.log('there was an error');
            console.error(err);
            return res.send(err);
        });
}                                                                                                      



/**
 * setPlayerFromCookie
 *
 * using the auth cookie on the req.controlpointer var, set the player var on the req.controlpointer object
 */
var setPlayerFromCookie = function setPlayerFromCookie(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    if (typeof req.controlpointer.auth === 'undefined')
        throw new Error('controlpointer.auth does not exist. please call setAuth middleware before setPlayerFromCookie middleware.')

    // find the player in the gamestate with the same cookie as the requester
    var playerData = gameState.players.red.concat(gameState.players.blu);
    var player = _.find(playerData, ['auth', req.controlpointer.auth]);
    
    if (typeof player === -1)
        return req.send('Your phone is not registered to an in-game identity. Have you registered your identity?');

    req.controlpointer.player = player;
    return next();
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


var adminAdvance = module.exports.adminAdvance = function adminAdvance(cpName, team) {
    return new Promise(function (resolve, reject) {
        console.log('capture::adminAdvance');
        if (typeof cpName !== 'string')
            return reject('first parameter to capture.adminAdvance must be a {string} control point name. got '+cpName);

        if (typeof team !== 'string')
            return reject('second parameter to capture.adminAdvance must be a {string} team name. got '+team);

        var cp = gameState.controlPoints[cpName];
        var state = cp.state;

        if (typeof cp === 'undefined')
            return reject('the control point the player is trying to capture does not exist in the game state!');

        if (typeof state !== 'string')
            return reject('the state of the controlpoint found in the gameState was not a string!');

        console.log('admin is advancing control point %s in team %s favor', cpName, team);

        if (team === 'red') {
            if (state === 'red')
                return reject('this controlpoint is already reds!');
            else if (state === 'blu')
                state = 'dbl';
            else if (state === 'unk')
                state = 'cre';
            else if (state === 'dbl')
                state = 'unk';
            else if (state === 'dre')
                state = 'red';
            else if (state === 'fdb')
                state = 'unk';
            else if (state === 'fdr')
                state = 'red';
            else if (state === 'cbl' || state === 'fcb')
                state = 'unk';
            else if (state === 'cre')
                state = 'red';
            else if (state === 'fcr')
                state = 'red';
        }
        else if (team === 'blu') {
            if (state === 'red')
                state = 'dre';
            else if (state === 'blu')
                return reject('this control point is already blus');
            else if (state === 'unk')
                state = 'cbl';
            else if (state === 'dbl')
                state = 'blu';
            else if (state === 'dre')
                state = 'unk';
            else if (state === 'fdb')
                state = 'blu';
            else if (state === 'fdr')
                state = 'unk';
            else if (state === 'cbl' || state === 'fcb')
                state = 'blu';
            else if (state === 'cre')
                state = 'unk';
            else if (state === 'fcr')
                state = 'unk';
        }

        return updateState(cpName, state);
        
    })
}


/**
 * advance
 *
 * advance a controlPoint's state to the next logical state.
 * used by the timer module to automatically change a controlPoint's state
 * when due.
 */
var advance = module.exports.advance = function advance(cpName, player) {
    return new Promise(function (resolve, reject) {
        console.log('capture::advance');
        
        if (typeof gameState.controlPoints[cpName] === 'undefined')
            throw new Error('cannot advance controlpoint '+cpName+' because that name is not in the game state');

        if (typeof player === 'undefined' || !player)
            throw new Error('second param to capture.advance must be a player object or {string} team name. got '+player);
        
        if (typeof player.affiliation === 'undefined')
            throw new Error('the player object must have an affilation property. got undefined');

        if (typeof player.abilities === 'undefined')
            throw (new Error('the player object must have an abilities property. got undefined');

        if (_.indexOf(player.abilities, 'capmantle') === -1)
            throw new Error('the player does not have the ability to capture or dismantle control points');

        var hasSabotage, hasClaim;
        // see if the player can fast capture or fast dismantle
        if (_.indexOf(player.abilities, 'sabotage') !== -1)
            hasSabotage = true;

        if (_.indexOf(player.abilities, 'claim') !== -1)
            hasClaim = true;
        
        var cp = gameState.controlPoints[cpName];
        var state = cp.state;
        var team = player.affiliation;

        if (typeof cp === 'undefined')
            throw new Error('the control point the player is trying to capture does not exist in the game state!');

        console.log('player %s %s on team %s is capturing point %s', 
                    player.firstName, 
                    player.lastName,
                    team,
                    cpName);
        

        if (team === 'red') {
            if (hasClaim) {
                if (state === 'red')
                    return reject(new Error('this controlpoint is already yours!'));
                else if (state === 'blu')
                    state = 'dbl';
                else if (state === 'unk')
                    state = 'fcr';
                else if (state === 'dbl')
                    return reject(new Error('control point is already dismantling!'));
                else if (state === 'dre')
                    state = 'red';
                else if (state === 'fdb')
                    return reject(new Error('control point is already dismantling!'));
                else if (state === 'fdr')
                    state = 'red';
                else if (state === 'cbl' || state === 'fcb')
                    state = 'fcr';
                else if (state === 'cre')
                    state = 'fcr';
                else if (state === 'fcr')
                    return reject(new Error('control point is already being claimed by your team!'));
            }
            else if (hasSabotage) {
                if (state === 'red')
                    return reject(new Error('this controlpoint is already yours!'));
                else if (state === 'blu')
                    state = 'fdb';
                else if (state === 'unk')
                    state = 'cre';
                else if (state === 'dbl')
                    state = 'fdb';
                else if (state === 'dre')
                    state = 'red';
                else if (state === 'fdb')
                    return reject(new Error('control point is already being sabotaged!'));
                else if (state === 'fdr')
                    state = 'red';
                else if (state === 'cbl' || state === 'fcb')
                    state = 'cre';
                else if (state === 'cre')
                    return reject(new Error('control point is already being captured by your team'));
                else if (state === 'fcr')
                    return reject(new Error('control point is already being claimed by your team'));
            }
            else {
                if (state === 'red')
                    return reject(new Error('this controlpoint is already yours!'));
                else if (state === 'blu')
                    state = 'dbl';
                else if (state === 'unk')
                    state = 'cre';
                else if (state === 'dre')
                    state = 'red';
                else if (state === 'fdb')
                    return reject(new Error('control point is already being sabotaged by your team!'));
                else if (state === 'fdr')
                    state = 'red';
                else if (state === 'cbl' || state === 'fcb')
                    state = 'cre';
                else if (state === 'cre' || state === 'fcr')
                    return reject(new Error('control point is already being captured by your team!'));
            }
        }

        else if (team === 'blu') {
            if (hasClaim) {
                if (state === 'red')
                    state = 'dre';
                else if (state === 'blu')
                    return reject(new Error('this control point is already yours!'));
                else if (state === 'unk')
                    state = 'fcb';
                else if (state === 'dbl')
                    state = 'blu';
                else if (state === 'dre')
                    return reject(new Error('control point is already being dismantled by your team!'));
                else if (state === 'fdb')
                    state = 'blu';
                else if (state === 'fdr')
                    return reject(new Error('control point is already being sabotaged by your team!'));
                else if (state === 'cbl')
                    state = 'fcb';
                else if (state === 'fcb')
                    return reject(new Error('control point is already being claimed by your team!'));
                else if (state === 'cre' || state === 'fcr')
                    state = 'fcb';
            }
            else if (hasSabotage) {
                if (state === 'red')
                    state = 'fdr';
                else if (state === 'blu')
                    return reject(new Error('this control point is already yours!'));
                else if (state === 'unk')
                    state = 'cbl';
                else if (state === 'dbl' || state === 'fdb')
                    state = 'blu';
                else if (state === 'dre')
                    state = 'fdr';
                else if (state === 'fdr')
                    return reject(new Error('control point is already being sabotaged by your team!'));
                else if (state === 'cbl')
                    return reject(new Error('control point is already being captured by your team!'));
                else if (state === 'fcb')
                    return reject(new Error('control point is already being claimed by your team!'));
                else if (state === 'cre' || state === 'fcr')
                    state = 'cbl';
            }
            else {
                if (state === 'red')
                    state = 'dre';
                else if (state === 'blu')
                    return reject(new Error('this control point is already owned by your team!'));
                else if (state === 'unk')
                    state = 'cbl';
                else if (state === 'dbl' || state === 'fdb')
                    state = 'blu';
                else if (state === 'dre')
                    return reject(new Error('control point is already being dismantled by your team!'));
                else if (state === 'fdr')
                    return reject(new Error('control point is already being sabotaged by your team!'));
                else if (state === 'cbl')
                    return reject(new Error('control point is already being captured by your team!'));
                else if (state === 'fcb')
                    return reject(new Error('control point is already being clamed by your team!'));
                else if (state === 'cre' || state === 'fcr')
                    state = 'cbl';
            }

        }

        return updateState(cpName, state);

    });
};

module.exports.api = function api(app) {
    app.get('/capture', become.init, become.setAction, setControlPoint, become.authorize, stateAdvanceMid);
}


var validateStateChange = module.exports.validateStateChange = function validateStateChange(oldState, reportedState) {
    return new Promise(function (resolve, reject) {

        if (oldState === null) oldState = 'unk';

        // UNCAPTURED can change to 'BLU, capturing', 'BLU, fast capturing', 'RED, capturing', or 'RED, fast capturing'
        if (oldState === 'unk') {
            if (reportedState === 'cbl' || reportedState === 'cre' || reportedState === 'fcb' || reportedState === 'fcr')
                resolve(reportedState);
            else
                return reject(new Error("UNCAPTURED must change to 'BLU, capturing', 'BLU, fast capturing', 'RED, capturing', or 'RED, fast capturing'."));
        }
                    
        // 'BLU, uncontested' can change to 'BLU, dismantling', or 'BLU, fast dismantling'
        if (oldState === 'blu') {
            if (reportedState === 'dbl' || reportedState === 'fdb')
                resolve(reportedState);
            else 
                return reject(new Error("BLU must change to 'BLU, dismantling', or 'BLU, fast dismantling'"));
        }

        // 'RED, uncontested' can change to 'RED, dismantling', or 'RED, fast dismantling'
        if (oldState === 'red') {
            if (reportedState === 'dre' || reportedState === 'fdr')
                resolve(reportedState);
            else
                return reject(new Error("RED must change to 'RED, dismantling', or 'RED, fast dismantling'"));
        }


        // 'BLU, dismantling' can change to 'BLU, uncontested', or UNCAPTURED
        if (oldState === 'dbl') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'BLU, dismantling' must change to 'BLU, uncontested', or 'UNCAPTURED'"));
        }

        // 'RED, dismantling' can change to 'RED, uncontested', or UNCAPTURED
        if (oldState === 'dre') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'RED, dismantling' must change to 'RED, uncontested', or 'UNCAPTURED'"));
        }

        // 'BLU, fast dismantling' can change to 'BLU, uncontested', or UNCAPTURED
        if (oldState === 'fdb') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'BLU, fast dismantling' must change to 'BLU, uncontested', or 'UNCAPTURED'"));
        }

        // 'RED, fast dismantling' can change to 'RED, uncontested', or UNCAPTURED
        if (oldState === 'fdr') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'RED, fast dismantling' must change to 'RED, uncontested', or 'UNCAPTURED'"));
        }


        // 'BLU, capturing' can change to 'BLU, uncontested', or 'UNCAPTURED'
        if (oldState === 'cbl') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'BLU, capturing' must change to 'BLU, uncontested' or UNCAPTURED"));
        }


        // 'RED, capturing' can change to 'RED, uncontested', or 'UNCAPTURED'
        if (oldState === 'cre') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'RED, capturing' must change to 'RED, uncontested' or UNCAPTURED"));
        }


        // 'BLU, fast capturing' can change to 'BLU, uncontested', or 'UNCAPTURED'
        if (oldState === 'fcb') {
            if (reportedState === 'blu' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'BLU, fast capturing' must change to 'BLU, uncontested' or UNCAPTURED"));
        }


        // 'RED, fast capturing' can change to 'RED, uncontested', or 'UNCAPTURED'
        if (oldState === 'fcr') {
            if (reportedState === 'red' || reportedState === 'unk')
                resolve(reportedState);
            else
                return reject(new Error("'RED, fast capturing' must change to 'RED, uncontested' or UNCAPTURED"));
        }

        return reject(new Error("oldState "+oldState+" is not a valid state. (reportedState="+reportedState+")"));
        
    })
}


/**
 * updateState
 *
 * @param {string} controlPoint 
 * @param {string} reportedState
 */
var updateState = module.exports.updateState = function updateState(controlPoint, reportedState) {
    console.log('capture::updateState');
    return new Promise(function (resolve, reject) {

        console.log('updateState controlPoint=%s reportedState=%s', controlPoint, reportedState);
        
        // make sure controlpoint exists in game state
        if (typeof gameState.controlPoints[controlPoint] === 'undefined')
            return reject(new Error('The controlpoint the client claims to have updated does not exist in the game!'));
        
        // validate that the state change is allowed according to the game's rules
        return validateStateChange(gameState.controlPoints[controlPoint].state, reportedState)
            .then(function(newState) {
                console.log('validated. changing to state %s', newState);

                var cp = gameState.controlPoints[controlPoint];

                // find the direction the controlpoint is going in (red or blu's favor?)
                var oldState = cp.state;
                var direction;
                if (
                    (oldState === 'red' && newState === 'dre') || 
                    (oldState === 'red' && newState === 'fdr') ||
                    (oldState === 'unk' && newState === 'cbl') ||
                    (oldState === 'unk' && newState === 'fcb') ||
                    (oldState === 'dre' && newState === 'unk') ||
                    (oldState === 'fdr' && newState === 'unk') ||
                    (oldState === 'cbl' && newState === 'blu') ||
                    (oldState === 'fcb' && newState === 'blu') ||
                    (oldState === 'cre' && newState === 'unk') ||
                    (oldState === 'fcr' && newState === 'unk')
                )
                    direction = 'blu';
                else if (
                    (oldState === 'blu' && newState === 'dbl') ||
                    (oldState === 'blu' && newState === 'fdb') ||
                    (oldState === 'unk' && newState === 'cre') ||
                    (oldState === 'unk' && newState === 'fcr') ||
                    (oldState === 'dbl' && newState === 'unk') ||
                    (oldState === 'fdb' && newState === 'unk') ||
                    (oldState === 'cre' && newState === 'red') ||
                    (oldState === 'fcr' && newState === 'red') ||
                    (oldState === 'cbl' && newState === 'unk') ||
                    (oldState === 'fcb' && newState === 'unk')
                )
                    direction = 'red';

                cp.direction = direction;
                cp.state = newState;
                cp.updateTime = moment();

                console.log('control point updating. direction=%s, state=%s, updateTime=%s', cp.direction, cp.state, cp.updateTime);

                return resolve('ok');
            });
    });
};

/**
 * stateAdvance
 *
 * Advance the given controlpoint to the next logical state
 * given the player who is scanning the QR code.
 */
var stateAdvance = module.exports.stateAdvance = function stateAdvance(controlPoint, player) {
    return new Promise(function (resolve, reject) {
        if (typeof controlPoint !== 'string')
            return reject('controlpoint parameter must be a {string} controlPoint name')

        if (typeof gameState.controlPoints[controlPoint] === 'undefined')
            return reject('The controlpoint the player claims to have captured does not exist in the game!');
        
        if (typeof player === 'undefined')
            return reject('second parameter to stateAdvance must be a player object. got undefined');
        
        if (typeof player.affiliation !== 'string')
            return reject('player object did not contain an affiliation property');

        if (typeof player.firstName !== 'string')
            return reject('player object did not contain a firstName property');

        if (typeof player.lastName !== 'string')
            return reject('player object did not contain a lastName property');

        if (typeof gameState.teams[player.affiliation] === 'undefined')
            return reject('the team the player claims to belongs to does not exist in the game!');

        var firstName = player.firstName;
        var lastName = player.lastName;
        var affiliation = player.affiliation;

        
        
        if (typeof player.capmantleCount === 'undefined') player.capmantleCount = 1;
        else player.capmantleCount += 1;        
    });
};

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


var validateStateChange = function validateStateChange(oldState, reportedState) {
    console.log('capture::validateStateChange');
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
                reject(new Error("UNCAPTURED must change to 'BLU, capturing', 'BLU, fast capturing', 'RED, capturing', or 'RED, fast capturing'."));
        }
                    
        // 'BLU, uncontested' can change to 'BLU, dismantling', or 'BLU, fast dismantling'
        if (oldState === 'blu') {
            if (reportedState === 'dbl' || reportedState === 'fdb')
                resolve(reportedState);
            else 
                reject(new Error("BLU must change to 'BLU, dismantling', or 'BLU, fast dismantling'"));
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

        reject(new Error("oldState "+oldState+" is not a valid state. (reportedState="+reportedState+")"));
        
    })
}
