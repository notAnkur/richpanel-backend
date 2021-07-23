const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fbid: String,
  firstName: String,
  lastName: String,
  displayName: String,
  accessToken: String,
  refreshToken: String,
  emails: [],
  photos: [],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema, 'user');