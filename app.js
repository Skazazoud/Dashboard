const express = require('express');
    path = require('path');
    port = process.env.PORT || 8080;
    mongoose = require('mongoose');
    passport = require('passport');
    flash = require('connect-flash');
    morgan = require('morgan');
    cookieParser = require('cookie-parser');
    bodyParser = require('body-parser');
    session = require('express-session');
    user = require('./models/user.js');
    configDB = require('./config/db.js');

var app = express();

mongoose.connect(configDB.url, {});

require('./config/passport')(passport);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'ilovescotchscotchyscotchscotch',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session({
    secret: 'Shhh.. This is (quite) a secret',
    cookie: {
        secure: true
    }
})); 
app.use(flash());

// routes ======================================================================
require('./routes.js')(app, passport);

app.listen(port);
