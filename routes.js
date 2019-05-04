module.exports = function(app, passport) {
	bcrypt = require('bcrypt-nodejs');
	User = require('./models/user');
    fs = require('fs');
    weather = require('weather-js');
    XMLHttpRequest = require('xmlhttprequest');
    Twit = require('twit');
    date = require('date-and-time');
    var usr = "Skaazed"
    var y = "153"

    var T = new Twit({
        consumer_key:         'BalQXpEwZ3hNcZiCCkJ7LBm9c',
        consumer_secret:      'bsXBPBZ29X8Zcdk4rtt6J3Jg7tHBCRbtcksXhLSuv70Fp5VxW2',
        access_token:         '1113094154643533824-V0HS0zVeEhaThAUE2vmau4TuKdkeQC',
        access_token_secret:  'bHO4zR5tLGQ8lsNmMmtfbnTtW9ZL5hiM8eIAMxfmZGmFD',
      })

    app.get('/about.json', function(req, res) {
        let rawdata = fs.readFileSync('./media/dashboard/about.json');  
            aboutFile = JSON.parse(rawdata);
        aboutFile.server.current_time = Math.floor(Date.now() / 1000);
        res.send(aboutFile);
    });

///////////////////////////////////////////////
////////////////////INDEX//////////////////////
///////////////////////////////////////////////
app.get('/', function(req, res) {
    res.render('index');
});
app.get('/accueil', isLoggedIn, function(req,res) {
    var user = req.user;
    res.render('accueil', {
        user: req.user,
    })
})
app.get('/services', isLoggedIn, function(req,res) {
    res.render('services', {
        user: req.user
    })
})
app.get('/unlink', isLoggedIn, function(req,res) {
    res.render('unlink', {
        user: req.user
    })
})
app.get('/widgets', isLoggedIn, function(req, res) {
    res.render('widgets', {
        user: req.user
    })
})
///////////////////////////////////////////////
////////////////////COMPTES////////////////////
///////////////////////////////////////////////
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/accueil',
    failureRedirect: '/',
    failureFlash: true
}));
app.get('/register', function(req, res) {
    res.render('register', {
        message: req.flash('signupMessage')
    });
});
app.post('/register',
    passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
///////////////////////////////////////////////
////////////////////SERVICES///////////////////
///////////////////////////////////////////////
app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
});
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect: '/services',
        failureRedirect: '/accueil'
    }),
    function(req, res) {
        var url = req.url;
        res.redirect('/');
    }
);
app.get('/auth/steam', function(req, res) {
    var user = req.user;
    user.steam.connected = true;
    user.save()
    res.redirect('/services')
})
app.get('/auth/meteo', function(req, res) {
    var user = req.user;
    user.meteo.active = true;
    user.save()
    res.redirect('/services')
})
app.get('/auth/timer', function(req, res) {
    var user = req.user;
    user.timer.active = true;
    user.save()
    res.redirect('/services')
})
app.get('/auth/nodemailer', function(req, res) {
    var user = req.user;
    user.nodemailer.active = true;
    user.save()
    res.redirect('/services')
})
///////////////////////////////////////////////
////////////////////UNLINK/////////////////////
///////////////////////////////////////////////
app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
        res.redirect('/unlink');
    });
});

app.get('/unlink/twitter', function(req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.twitter.connected = false;
    if (user.twitter.widget) {
        user.twitter.widget = false;
    }
    user.save(function(err) {
        res.redirect('/unlink');
    });
});
app.get('/unlink/steam', function(req, res) {
    var user = req.user;
    user.steam.connected = false;
    user.steam.widget = false;
    user.save()
    res.redirect('/unlink')
})
app.get('/unlink/meteo', function(req, res) {
    var user = req.user;
    user.meteo.active = false;
    if (user.meteo.widget) {
        user.meteo.widget = false;
    }
    user.save(function(err) {
        res.redirect('/unlink')
    })
})
app.get('/unlink/timer', function(req, res) {
    var user = req.user;
    user.timer.active = false;
    if (user.timer.widget) {
        user.timer.widget = false;
    }
    user.save(function(err) {
        res.redirect('/unlink')
    })
})
app.get('/unlink/nodemailer', function(req, res) {
    var user = req.user;
    user.nodemailer.active = false;
    user.save(function(err) {
        res.redirect('/unlink')
    })
})
///////////////////////////////////////////////
///////////////////WIDGETS/////////////////////
///////////////////////////////////////////////
app.post('/widgets/twitter', function(req, res) {
    var user = req.user;
    if (req.body.widget == 1) {
        user.twitter.actions.followers = true;
        T.get('followers/ids', { screen_name: usr },  function (err, data, response) {
            var x = length(data)
            user.twitter.data.followers = x
        })
          user.save()
          
    }
    else if (req.body.widget == 2) {
        user.twitter.actions.following = true;
        T.get('following/ids', { screen_name: usr },  function (err, poop, response) {
          })
          user.twitter.data.following = y
          user.save()
    }
    user.twitter.widget = true;
    user.save()
    res.redirect('/widgets')
})
app.post('/widgets/steam', function(req, res) {
    var user = req.user;
    if (req.body.widget == 1)
        user.steam.actions.games = true;
    else if (req.body.widget == 2)
        user.steam.actions.friends = true;
    user.steam.widget = true;
    user.save()
    res.redirect('/widgets')
})
app.post('/widgets/meteo', function(req, res) {
    var user = req.user;
    if (req.body.city == 2) {
        user.meteo.cities.lyon = true;
        weather.find({search: "Lyon, France", degreeType: 'C'}, function(err, result) {
            test = JSON.stringify(result[0].current.temperature);
            sky = JSON.stringify(result[0].current.skytext)
            meuh = test.split("")
            user.meteo.weather.temperatureLyon = meuh[1];
            user.meteo.weather.skyLyon = sky
            user.save()
        })
    }
    else if (req.body.city == 1) {
        user.meteo.cities.paris = true;
        weather.find({search: "Paris, France", degreeType: 'C'}, function(err, result) {
            test = JSON.stringify(result[0].current.temperature);
            sky = JSON.stringify(result[0].current.skytext)
            meuh = test.split("")
            user.meteo.weather.temperatureParis = meuh[1];
            user.meteo.weather.skyParis = sky
            user.save()
        })
    }
    else if (req.body.city == 3) {
        user.meteo.cities.bordeaux = true;
        weather.find({search: "Bordeaux, France", degreeType: 'C'}, function(err, result) {
            test = JSON.stringify(result[0].current.temperature);
            sky = JSON.stringify(result[0].current.skytext)
            meuh = test.split("")
            user.meteo.weather.temperatureBordeaux = meuh[1];
            user.meteo.weather.skyBordeaux = sky
            user.save()
        })
    }
    else if (req.body.city == 4) {
        user.meteo.cities.marseille = true;
        weather.find({search: "Marseille, France", degreeType: 'C'}, function(err, result) {
            test = JSON.stringify(result[0].current.temperature);
            sky = JSON.stringify(result[0].current.skytext)
            meuh = test.split("")
            user.meteo.weather.temperatureMarseille = meuh[1];
            user.meteo.weather.skyMarseille = sky
            user.save()
        })
    }
    user.meteo.widget = true;
    user.save()
    res.redirect('/widgets')
})
app.post('/widgets/timer', function(req, res) {
    var user = req.user;
    user.timer.widget = true;
    let now = new Date();
    d_a_t_e = date.format(now, 'h:m A');
    if (req.body.zone == 1) {
        user.timer.activeW.france = true;
        let date_france = date.addHours(now, +2);
        user.timer.time.france = date_france
        user.save()
    }
    else if (req.body.zone == 2) {
        user.timer.activeW.uk = true;
        let uk = date.addHours(now, +1);
        user.timer.time.uk = uk
        user.save()
    }
    else if (req.body.zone == 3) {
        user.timer.activeW.russia = true;
        let russia = date.addHours(now, -7);
        user.timer.time.usa = russia
        user.save()
    }
    else if (req.body.zone == 4) {
        user.timer.activeW.japan = true;
        let japan = date.addHours(now, +9);
        user.timer.time.japan = japan
        user.save()
    }
    res.redirect('/widgets')
})
app.post('/widgets/nodemailer', function(req, res) {
    var user = req.user;
    user.nodemailer.active = true;
    user.save()
    res.redirect('/widgets')
})
app.get('/widgets/twitter/remove', function(req, res) {
    var user = req.user;
    user.twitter.actions.followers = false;
    user.twitter.actions.following = false;
    user.twitter.widget = false;
    user.save()
    res.redirect('/widgets')
})
app.get('/widgets/steam/remove', function(req, res) {
    var user = req.user;
    user.steam.actions.games = false;
    user.steam.actions.friends = false;
    user.steam.widget = false;
    user.save()
    res.redirect('/widgets')
})
app.get('/widgets/meteo/remove', function(req, res) {
    var user = req.user;
    user.meteo.widget = false;
    user.meteo.cities.lyon = false;
    user.meteo.cities.paris = false;
    user.meteo.cities.bordeaux = false;
    user.meteo.cities.marseille = false;
    user.save()
    res.redirect('/widgets')
})
app.get('/widgets/timer/remove', function(req, res) {
    var user = req.user;
    user.timer.activeW.france = false;
    user.timer.activeW.uk = false;
    user.timer.activeW.russia = false;
    user.timer.activeW.japan = false;
    user.timer.widget = false;
    user.save()
    res.redirect('/widgets')
})
///////////////////////////////////////////////
////////////////FONCTCIONS/////////////////////
///////////////////////////////////////////////
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
	}
}

function length(obj) {
    return Object.keys(obj).length;
}