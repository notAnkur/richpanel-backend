const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  id: String,
  message: String,
  type: String,
  firstName: String,
  lastName: String,
  profilePic: String,
  profileId: String, // sender's id
  recipientId: String,
  pageId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema, 'conversation');