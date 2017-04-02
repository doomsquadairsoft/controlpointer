

var fs = require('fs');
var html = 'file:///Users/lol/scripts/controlpointer/client_app/oneface.html';

var page = require('webpage').create();

//viewportSize being the actual size of the headless browser
page.viewportSize = { width: 100, height: 100 };

//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 100, height: 100 };

//the rest of the code is the same as the previous example
page.open(html, function() {
    var randomName = Math.random().toString(24).replace(/[^a-z]+/g, '').substr(0, 12);
    var fileName = fs.absolute('./client_app/images/faces/face_'+randomName+'.png');
    page.render(fileName);
    console.log(fileName);
    phantom.exit();
});




