//
// Authentication submodule.
//
// Players visit one of these endpoint URLs to register themselves as an identity
//

var _ = require('lodash');
var gameState = require('./state');




module.exports.authorize = function authorize(req, res, next) {

    if (typeof req.query.sourceid === 'undefined')
        return res.send('The request query must contain a sourceid. Did you scan a correct QR code?');
    if (typeof req.query.action === 'undefined')
        return res.send('The request query must contain an action. Did you scan a correct QR code?');

    var sourceid = req.query.sourceid;
    var action = req.query.action;

    console.log('authing');
    console.log(gameState);
    if (typeof req.cookies.auth !== 'undefined') {
        var playerData = gameState.players.red.concat(gameState.players.blu);
        var player = _.find(playerData, 'auth');
        if (typeof player === 'undefined') {
            return res.status(401).send('You cannot do this action because you are registered to an identity that does not exist in the current game. Please register a new identity.');
        }
        else {
            // client is registered as a player in the current game
            // determine if their player can do the action they are wanting to do
            // do do this, we look up the classes object in game state
            // the classes object should have an array of strings which list the abilities the class can do.
            if (_.indexOf(player.abilities, action) === -1) {
                return res.send('You cannot do that action because your player identity does not have that ability!');
            }
            else {
                return next();
            }
        }
    }

    else {
        res.send('You are not authorized to carry out this action! Have you registered your in-game identity?');
    }
}

module.exports.api = function api(app) {

    app.get('/forget', function(req, res) {
        res.clearCookie('auth');
        res.send('Phone forgotten! Now you can register as another identity.');
    });
    app.get('/become', function(req, res) {
        
        if (typeof req.query.team === 'undefined')
            return res.send('the query parameters must specify a team. example: /become?team=red')
        if (typeof req.query.class === 'undefined')
            return res.send('the query parameters must specify a class. example: /become?team=red&class=grenadier');
        if (typeof req.query.id === 'undefined')
            return res.send('the query parameters must specify a player id. example: /become?team=red&class=grenadier&id=7qdwek0zonsp');
        if (req.query.team !== 'red' && req.query.team !== 'blu')
            return res.send('TEAM in the query parameters must be either red or blu');
        
        var team = req.query.team;
        var cls = req.query.class;
        var id = req.query.id;
        
        // use the game token to create a player auth token.
        // store the player auth token in the gameState.
        // send the player auth token to the player as a cookie.
        // in subsequent requests to the player's URLs, require that they send a matching cookie
        
        var playerData = gameState.players.red.concat(gameState.players.blu);
        var player = _.find(playerData, ['id', id]);

        var token;
        if (typeof player.token !== 'undefined')
            token = player.token;
        else
            token = Math.random().toString(24).replace(/[^a-z]+/g, '').substr(0, 12);
        

        // see if player has already become someone
        if (typeof req.cookies.auth !== 'undefined') {

            // see if player has already become who they are asking to be
            console.log('comparing %s with %s', req.cookies.auth, player.token);
            if (req.cookies.auth === player.token) {
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
                    res.clearCookie('redmedic');
                }

                else {
                    // phone is already registered to an identity
                    console.log('>> alreadyPlayer');
                    console.log(alreadyPlayer);
                    var alreadyAffiliation = alreadyPlayer.affiliation;
                    var alreadyClass = alreadyPlayer.class;
                    return res.send('You cannot become '+team+' '+cls+' because you are already '+
                                    alreadyAffiliation+' '+alreadyClass+'!');
                }
            }
        }


        // player has not become someone, so let them become the player they are asking to become
        console.log(player);
        player.auth = token;
        
        var day = (1000 * 60 * 60 * 24);
        res.cookie('auth', token, { maxAge: day });
        res.send('This phone has been registered to '+player.firstName+' '+player.lastName+' ('+id+'), a '+player.affiliation+' '+player.class+'.');
    });

}
    


