/**
 * timer submodule
 *
 * handles updating the controlpoints.
 *
 * for example, a red player gets to uncaptured trollBridge, and scans the QR code.
 * the state changes from UNK to CRE.
 * without a timer, the state would forever remain in CRE.
 * the timer uses gameState.controlPoints.timers to find the length of time that trollBridge
 * should stay in CRE before updating the controlpoint to RED.
 * 
 * The way timers are entered in gameState.controlPoints.timers is as follows.
 * "stay in this state for this length of time, before automatically switching to the next logical state"
 */


var gameState = require('./state');
var capture = require('./capture');
var moment = require('moment');



var timerHandle = '';



var start = module.exports.start = function start() {
    timerHandle = setInterval(tick, 200);
}


var tick = module.exports.tick = function tick() {
    // for each controlpoint, find out if a state update is due.
    var cps = gameState.controlPoints;
    for (var c in cps) {
        var state = cps[c].state;
        if (state === 'unk' || state === 'red' || state === 'blu') {
            //console.log('state=%s cp=%s so doing nothing', state, c);
        }
        else {
            var updateTime    = moment(cps[c].updateTime);
            var relevantTimer = gameState.timers[state];
            var dueTime       = moment(updateTime).add(relevantTimer, 'ms');
            var direction     = cps[c].direction;
            if (moment().isAfter(dueTime)) {
                //console.log('%s is overdue for a state update. (updateTime=%s, relevantTimer=%s, dueTime=%s state=%s direction=%s)', c, updateTime.format(), relevantTimer, dueTime.format(), state, direction);
                
                return capture.adminAdvance(c, direction)
                              .then(function(result) {
                                  console.log(result);
                              });

            }
            else {
                console.log('%s is not due for a state update. (updateTime=%s, relevantTimer=%s, dueTime=%s state=%s direction=%s)', c, updateTime.format(), relevantTimer, dueTime.format(), state, direction);
            }
        }
    }
}
