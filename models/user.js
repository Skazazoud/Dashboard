const mongoose = require('mongoose');
    bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local: {
        email: String,
        password: String,
    },
    twitter: {
        id: String,
	    token: String,
        connected: Boolean,
        widget: Boolean,
        actions: {
            followers: Boolean,
            following: Boolean,
        },
        data: {
            followers: String,
            following: String
        }
    },
    meteo: {
        active: Boolean,
        widget: Boolean,
        cities: {
            lyon: Boolean,
            paris: Boolean,
            bordeaux: Boolean,
            marseille: Boolean
        },
        weather: {
            temperatureParis: String,
            skyParis: String,
            temperatureLyon: String,
            skyLyon: String,
            temperatureBordeaux: String,
            skyBordeaux: String,
            temperatureMarseille: String,
            skyMarseille: String,
        }
    },
    timer: {
        active: Boolean,
        widget: Boolean,
        activeW: {
            france: Boolean,
            uk: Boolean,
            russia: Boolean,
            japan: Boolean
        },
        time: {
            france: String,
            uk: String,
            usa: String,
            japan: String
        }
    },
    steam: {
        id: String,
        token: String,
        connected: Boolean,
        widget: Boolean,
        actions: {
            games: Boolean,
            friends: Boolean,
        }
    },
    nodemailer: {
        active: Boolean
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
