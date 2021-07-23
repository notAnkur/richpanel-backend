const route = require("express").Router();
const jwt = require("jsonwebtoken");
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const UserService = require("../Services/User.service");

const { verifyToken } = require("../utils/verifyToken");

passport.use(new Strategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'photos', 'name', 'displayName', 'gender', 'profileUrl', 'email']
},
async (accessToken, refreshToken, profile, cb) => {
  const { id: fbid, displayName, name, emails, photos, _json } = profile;
  const { first_name: firstName, last_name: lastName } = _json;
  const user = await UserService.getUser(fbid);
  if(!user) {
    console.log("Creating user")
    const userData = {
      fbid,
      firstName,
      lastName,
      displayName,
      accessToken,
      refreshToken,
      emails,
      photos,
      createdAt: new Date()
    };
    const newUser = await UserService.createUser(userData);
    profile = newUser;
  }

  return cb(null, profile);
}));


route.get('/facebook', passport.authenticate('facebook', {
  scope: process.env.FACEBOOK_SCOPES
}));

route.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_HOST}/error`}), (req, res) => {
    const { user } = req || {};
    const { fbid } = user || {};
    jwt.sign({fbid}, process.env.JWT_SECRET, {expiresIn: '30d'}, (err, token) => {
    if(err) throw err;
    res.status(200).json({token, profile: user, isLoggedIn: true, message: "Successful login"});
  });
});

route.get('/verifyoldtoken', verifyToken, (req, res) => {
	jwt.verify(req.token, process.env.JWT_SECRET, (err, response) => {
		if(err) console.log(err);
		if(response) {
			res.status(200).json({isLoggedIn: true, message: "Token still valid"});
		} else {
			res.status(403).json({isLoggedIn: false, message: "Token Invalid"});
		}
	})
});

module.exports = route;