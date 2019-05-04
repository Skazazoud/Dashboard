const	LocalStrategy = require('passport-local').Strategy;
	TwitterStrategy = require('passport-twitter').Strategy;
	User = require('../models/user.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            // asynchronous
            process.nextTick(function() {
                User.findOne({
                    'local.email': email
                }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    // all is well, return user
                    else
                        return done(null, user);
                });
            });
        }));
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            // asynchronous
            process.nextTick(function() {
                // if the user is not already logged in:
                if (!req.user) {
                    User.findOne({
                        'local.email': email
                    }, function(err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);
                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        } else {
                            // create the user
                            var newUser = new User();

                            newUser.local.email = email;
                            newUser.local.password = newUser.generateHash(password);
                            newUser.save(function(err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });
                } else if (!req.user.local.email) {
                    User.findOne({
                        'local.email': email
                    }, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        } else {
                            var user = req.user;

                            user.local.email = email;
                            user.local.password = user.generateHash(password);
                            user.save(function(err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    return done(null, req.user);
                }
            });
	}));
	passport.use(
		new TwitterStrategy({
			consumerKey: "",
			consumerSecret: "",
			callbackURL: "http://localhost:8080/auth/twitter/callback",
			passReqToCallback: true
		    },
		    function(req, token, tokenSecret, profile, done) {
			// asynchronous
			process.nextTick(function() {
			    // check if the user is already logged in
			    if (!req.user) {
				User.findOne({
				    'twitter.id': profile.id
				}, function(err, user) {
				    if (err)
					return done(err);
				    // if there is a user id already but no token (user was linked at one point and then removed)
				    if (!user.twitter.token) {
					user.twitter.token = token;
					user.twitter.connected = true;
					user.save(function(err) {
					    if (err)
						throw err;
					    return done(null, user);
					});
				    }
				    return done(null, user); // user found, return that user
				});
			    } else {
				// user already exists and is logged in, we have to link accounts
				var user = req.user; // pull the user out of the session
	
				user.twitter.id = profile.id;
				user.twitter.token = token;
				user.twitter.connected = true;
				user.save(function(err) {
				    if (err)
					throw err;
				    return done(null, user);
				});
			}
		});
	}));
};