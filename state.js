var moment = require('moment');
var url = require('url');

var State = {
    'url': url.parse('http://127.0.0.1:5000/'),
    'gameStartTime': moment(),
    'teams': {
        'red': true,
        'blu': true
    },
    'players': {

    },
    'deathTickets': {
        'red': 50,
        'blu': 50
    },
    // [controlPoints] is set using data from ./client_app/cpdata.json
};




module.exports = State;
