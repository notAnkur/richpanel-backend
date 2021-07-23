const express = require('express');
const app = express();
const port = 8001;
const passport = require('passport');
const cors = require('cors');
const db = require('./web/db/index.js');

// import routes
const authRoute = require("./web/routes/auth.route");
const conversationRoute = require("./web/routes/conversation.route");
const messengerRoute = require("./web/routes/messenger.route");

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(cors());
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);
app.use('/conversations', conversationRoute);
app.use('/messenger', messengerRoute);

db.connect()
  .then(() => console.log("db connected"));

app.listen(port, () => {
  console.log(`App is listening on ${port}`);
})