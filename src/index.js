// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================
app.use(morgan('dev'));
app.use('/assets', express.static(__dirname + '/assets'));                 // set the static files location /public/img will be /img for users
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/app', express.static(__dirname + '/app'));


// listen (start app with node server.js) ======================================
app.listen(10000);
console.log("App listening on port 10000");

app.get('*', function(req, res) {
    res.sendFile('./index.html', { root: __dirname });
});

app.get('/admin', function(req, res) {
    res.sendFile('./index.admin.html', { root: __dirname });
});


var admin = require("firebase-admin");
var serviceAccount = require("./app/shareds/auth.credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://prontomed-be7cc.firebaseio.com"
});