// Medic subsystem

// when the game starts, the first phone to visit the medic page gets a special auth cookie.
// that auth cookie signifies that the phone is a medic.
// subsequent requests to heal players will only succeed if the auth cookie exists.


var randomSecret = Math.random().toString(24).replace(/[^a-z]+/g, '').substr(0, 12);


var redmedic = '';
var blumedic = '';
var testmedic = '';
var gameToken = randomSecret;


var healPlayer = function healPlayer(id) {
    var affiliation = gameState.players[id].team;
    var firstName = gameState.players[id].firstName;
    var lastName = gameState.players[id].lastName;;

    // exit if affiliation could not be determined, or was something other than red or blu
    if (typeof affiliation === 'undefined' || affiliation !== 'red' || affilliation !== 'blu') return 0

    // increment this player's death count // not implemented
    //gameState.players[id].deaths += 1;
    
    // deduct death ticket
    gameState.deathTickets[affiliation] -= 1;

    return firstName+' '+lastName;
}

module.exports = function medic(app, gameState) {
    app.get('/heal/:id', function(req, res) {
        console.log(req.params);
        if (typeof req.params.id === 'undefined') {
            res.send('Heal? Heal WHO? Did you scan the QR code or are you A HAXXOR!?');
        }
        else {
            var id = req.params.id;
            if (typeof gameState.players[id] === 'undefined') {
                res.send('You cannot heal a player that is not in the game!');
            }
            else {
                var result = healPlayer(id);
                // @todo random perks or detriments such as morphine high or broken arm
                res.send('Player %s healed!', result);
            }
        }
    });

    
    app.get('/forget', function(req, res) {
        if (req.cookies.redmedic) {
            res.clearCookie('redmedic');
            res.send('You are no longer the RED medic!');
        }
        
        else {
            res.send('You are not a special class, so there is nothing I can do!');
        }
    });

    app.get('/redmedic', function(req, res) {
        console.log('Cookies: ', req.cookies);

        // tell the user they are already the red medic if that's the case
        if (req.cookies.redmedic === gameToken) {
            res.send('You are already the RED medic!');
        }

        // this user is not already the red medic
        else {

            // let the user become the red medic if nobody is the red medic already
            if (redmedic === '') {        
                var day = (1000 * 60 * 60 * 24);
                res.cookie('redmedic', gameToken, { maxAge: day });
                res.send('You are now the RED medic');
            }
            else {
                res.send('You cannot become the RED medic! Someone else is already the RED medic!');
            }
        }
    });

    app.get('/blumedic', function(req, res) {
        console.log('Cookies: ', req.cookies);
        res.send('BLU medic');
    });

    app.get('/testmedic', function(req, res) {
        res.send('TEST medic');
    });
}
