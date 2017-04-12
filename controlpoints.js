#!/usr/bin/env node


// generates HTML pages for printing control point QR codes
//   writes to client_app/controlpoints.html


var Handlebars = require('handlebars');
var cpdata = require('./client_app/cpdata.json');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var os = require('os');
var qr = require('./qr');
var moment = require('moment');
var gameState = require('./state');
var url = require('url');


// validate controlpoint data
if (typeof cpdata.controlPoints === 'undefined') throw new Error('cpdata.json must have a controlPoints property');
var controlPoints = cpdata.controlPoints;
for (var c in controlPoints) {
    if (controlPoints.hasOwnProperty(c)) {
        if (typeof controlPoints[c].latLng === 'undefined') throw new Error('each controlpoint must have a latLng property');
        if (typeof controlPoints[c].initialTeam === 'undefined') throw new Error('each controlpoint must have an initialTeam property');
        if (typeof controlPoints[c].title === 'undefined') throw new Error('each class must have a title property');
    }
}

if (typeof cpdata.timers === 'undefined') throw new Error('cpdata.json must have a timers property');
var timers = cpdata.timers;
if (typeof timers.cbl !== 'number') throw new Error('timers must have a {Number} cbl property');
if (typeof timers.cre !== 'number') throw new Error('timers must have a {Number} cre property');
if (typeof timers.fcr !== 'number') throw new Error('timers must have a {Number} fcr property');
if (typeof timers.fcb !== 'number') throw new Error('timers must have a {Number} fcb property');
if (typeof timers.dbl !== 'number') throw new Error('timers must have a {Number} dbl property');
if (typeof timers.dre !== 'number') throw new Error('timers must have a {Number} dre property');
if (typeof timers.fdr !== 'number') throw new Error('timers must have a {Number} fdr property');
if (typeof timers.fdb !== 'number') throw new Error('timers must have a {Number} fdb property');



// add timer data to individual capture points
// add qr data also
for (var c in controlPoints) {
    if (controlPoints.hasOwnProperty(c)) {
        controlPoints[c].captureTime = timers.cbl;
        controlPoints[c].dismantleTime = timers.dbl;
        var cpKey = c;
        var data = url.resolve(gameState.url.href, 'capture?cp='+cpKey);
        var imagePath = qr.create(data);
        controlPoints[c].qr = {
            caption: 'Dismantle/Capture',
            data: data,
            image: imagePath
        };
    }
}



// use data to generate an html template (used for printing cards)
var cpTplFile = fs.readFileSync('./templates/controlpoint.hbs', { 'encoding': 'utf8' });
var cpsTplFile = fs.readFileSync('./templates/controlpoints.hbs', { 'encoding': 'utf8' });
Handlebars.registerPartial('controlpoint', cpTplFile);
Handlebars.registerHelper('humanize', function(options) {
    var d = moment.duration(parseInt(options.fn(this)));
    if (d.asMinutes() > 60) {
        return d.asHours()+' hours';
    }
    
    else if (d.asSeconds() > 60) {
        return d.asMinutes()+' minutes';
    }

    else {
        return d.asSeconds()+' seconds';
    }

});
Handlebars.registerHelper('uppercase', function(options) {
    return options.fn(this).toUpperCase();
});


var template = Handlebars.compile(cpsTplFile);
var html = template(cpdata);

fs.writeFileSync('./client_app/controlpoints.html', html, { 'encoding': 'utf8' });

console.log('HTML written. Open this file in your browser and print. file://%s ', path.resolve('./client_app/controlpoints.html'));

