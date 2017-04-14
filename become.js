//
// Authentication submodule.
//
// Players visit one of these endpoint URLs to register themselves as an identity
//

var _ = require('lodash');
var gameState = require('./state');
var errors = require('./errors');



var interact = module.exports.interact = function interact(req, res, next) {
    if (typeof req.query.sourceid === 'undefined')
        return res.send('The request query must contain a sourceid. Did you scan a correct QR code?');
    var sourceid = req.query.sourceid;
}

var init = module.exports.init = function init(req, res, next) {
    if (typeof req.controlpointer === 'undefined')
        req.controlpointer = {};

    return next();
}

/**
* setAction
*
*   - sets the action variable in req.controlpointer
*     which is used by become.authenticate
*     to determine if a player is allowed to complete this action
*/
var setAction = module.exports.setAction = function setAction(req, res, next) {

    if (typeof req.controlpointer === 'undefined')
        throw new controlpointerUndefinedErr;

    req.controlpointer.action = 'capmantle';

    return next();

};



/**
 * become.authorize
 *
 *   - find the playerobject using their cookie
 *   - if they dont have a cookie, bounce them.
 *
 * delegate further action to next()
 *   - the next function can use req.cookies.auth for further authentication
 *     or req.controlpointer.player to access the data of the player that was authorized.
 */
var authorize = module.exports.authorize = function authorize(req, res, next) {

    if (typeof req.controlpointer === 'undefined')
        throw errors.controlpointerUndefinedErr;

    if (typeof req.controlpointer.action === 'undefined')
        return res.send('The request query must contain an action. Did you scan a correct QR code?');
    var action = req.controlpointer.action;


    if (typeof req.cookies.auth !== 'undefined') {
        // the requester has a cookie

        var playerData = gameState.players.red.concat(gameState.players.blu);
        var player = _.find(playerData, ['auth', req.cookies.auth]);

        if (typeof player === 'undefined') {
            return res.status(401).send('You cannot do this action because you are registered to an identity that does not exist in the current game. Please register a new identity.');
        }
        else {
            // client is registered as a player in the current game
            // determine if their player can do the action they are wanting to do
            // to do this, we look up the classes object in game state
            // the classes object should have an array of strings which list the abilities the class can do.
            console.log('requesting player is holding a cookie for %s %s %s', player.affiliation, player.firstName, player.lastName);

            if (_.indexOf(player.abilities, action) === -1) {
                return res.send('You cannot do that action because your player identity does not have that ability!');
            }
            else {
                req.controlpointer.player = player;
                return next();
            }
        }
    }

    else if (req.controlpointer.action === 'register') {
        
    }
    
    else {
        res.send('You are not authorized to carry out this action! Have you registered your in-game identity?');
    }
}

module.exports.api = function api(app) {
    app.get('/interact', init, authorize, function(req, res) {
        if (req.controlpointer.action === 'register') {
            
            console.log('interact entpoint');
            console.log(req.controlpointer);
            res.send('hi there');
        }
    });

    app.get('/forget', function(req, res) {
        res.clearCookie('auth');
        res.send('Phone forgotten! Now you can register as another identity.');
    });
    app.get('/become', function(req, res) {
        
        if (typeof req.query.sourceid === 'undefined')
            return res.send('the query parameters must specify a player sourceid. example: /become?sourceid=7qdwek0zonsp');
        if (req.query.affiliation !== 'red' && req.query.affiliation !== 'blu')
            return res.send('AFFILIATION in the query parameters must be either red or blu');
        
        var affiliation = req.query.affiliation;
        var cls = req.query.class;
        var id = req.query.sourceid;
        
        // use the game token to create a player auth token.
        // store the player auth token in the gameState.
        // send the player auth token to the player as a cookie.
        // in subsequent requests to the player's URLs, require that they send a matching cookie
        
        var playerData = gameState.players.red.concat(gameState.players.blu);
        var player = _.find(playerData, ['id', id]);

        if (typeof player === 'undefined') {
            // requested player does not exist in this game
            return res.send('the requesting player does not exist in this round. This can happen if your phone is still registered as an identity from last round. Have you scanned your new ID for this round?');
        }

        var auth;
        if (typeof player.auth !== 'undefined')
            auth = player.auth;
        else
            auth = Math.random().toString(24).replace(/[^a-z]+/g, '').substr(0, 12);
        

        // see if player has already become someone
        if (typeof req.cookies.auth !== 'undefined') {

            // see if player has already become who they are asking to be
            console.log('comparing %s with %s', req.cookies.auth, player.auth);
            if (req.cookies.auth === player.auth) {
                // player has already become.
                return res.send('Your phone is already registered as '+player.firstName+' '+player.lastName+', '+player.affiliation+' '+player.class+'.');
            }
            
            else {
                // see if player has already become someone else
                // find who they are
                var alreadyPlayer = _.find(playerData, ['auth', req.cookies.auth]);
                if (typeof alreadyPlayer === 'undefined') {
                    // the phone has a cookie that it not in the current game. delete the cookie!
                    console.log('clearing old cookie');
                    res.clearCookie('auth');
                }

                else {
                    // phone is already registered to an identity
                    console.log('>> alreadyPlayer');
                    console.log(alreadyPlayer);
                    var alreadyAffiliation = alreadyPlayer.affiliation;
                    var alreadyClass = alreadyPlayer.class;
                    return res.send('You cannot become '+affiliation+' '+cls+' because you are already '+
                                    alreadyAffiliation+' '+alreadyClass+'!');
                }
            }
        }


        // player has not become someone, so let them become the player they are asking to become
        console.log(player);
        player.auth = auth;
        
        var day = (1000 * 60 * 60 * 24);
        res.cookie('auth', auth, { maxAge: day });
        res.send('This phone has been registered to '+player.firstName+' '+player.lastName+' ('+id+'), a '+player.affiliation+' '+player.class+'.');
    });

}
    


