const route = require("express").Router();
const mongoose = require('mongoose');
const ConversationService = require("../Services/Conversation.service");
const User = require("../Services/User.service");
const {
  getMessengerProfileInfo,
  sendResponse
} = require("../utils/helpers/messenger.helper");

const { getPageAccessToken } = require("../utils/helpers/conversation.helper");

const { verifyToken } = require("../utils/verifyToken");

/**
 * Couldn't use webhooks for page_post_comments because can't get "real" data without app going live
 * But I am using webhooks for messenger events(messages and messages_echoes)
 */
// webhook verification

route.get('/webhook', (req, res) => {
  console.log(req.query)
  console.log(req.query['hub.challenge'])
  res.send(req.query['hub.challenge'])
});

route.post('/webhook', async (req, res) => {
  console.log(JSON.stringify(req.body))
  const { entry: entryArr, object } = req.body || {};

  if(object==="page") {
    for(const entry of entryArr) {
      const { id: currUserId, messaging } = entry || {};
      const { sender, recipient, timestamp, message } = messaging[0] || {};
      const { id: senderId } = sender || {};
      const { id: recipientId } = recipient || {};
      const { mid, text: messageText } = message || {};
  
      const newData = {
        id: new mongoose.Types.ObjectId(),
        message: messageText,
        type: 'DM',
        firstName: '',
        lastName: '',
        profileId: senderId,
        recipientId,
        pageId: currUserId,
        profilePic: "",
        createdAt: new Date(timestamp)
      };
      // upsert it in the db
      await ConversationService.upsertConversation(newData.id, newData);
    }
  }

  res.sendStatus(200)
});

route.post('/respond/:conversationId', verifyToken, async (req, res) => {
  const { fbid } = req || {};
  const { conversationId } = req.params || {};
  const { message } = req.body || {};

  if(!conversationId) {
    res.status(400).json({isLoggedIn: true, message: "bad params"});
  }

  const userDetails = await User.getUser(fbid);
  const { accessToken } = userDetails || {};

  const conversationData = await ConversationService.getConversationById(conversationId);
  const { pageId, profileId, recipientId } = conversationData || {};

  const pageDetails = await getPageAccessToken(pageId, accessToken);

  const { access_token: pageAccessToken } = pageDetails || {};

  const reciever = (pageId == recipientId) ? profileId : recipientId;
  
  const newResponse = await sendResponse(pageAccessToken, reciever, message);

  res.json({ response: newResponse }).status(200);
});

route.get('/profile/:profileId', verifyToken, async (req, res) => {
  const { fbid } = req || {};
  const { profileId } = req.params || {};

  if(!profileId) {
    res.status(400).json({isLoggedIn: true, message: "bad params"});
  }

  const userDetails = await User.getUser(fbid);
  const { accessToken } = userDetails || {};
  
  const userinfo = await getMessengerProfileInfo(profileId, accessToken);
  const {
    first_name: firstName,
    last_name: lastName,
    profile_pic: profilePic,
    id: userId,
    name: profileName
  } = userinfo || {};

  const formattedUser = {
    firstName: firstName || profileName.split(" ")[0],
    lastName: lastName || profileName.split(" ")[0],
    profilePic: profilePic || "",
    id: userId
  };

  res.json({ ...formattedUser }).status(200);
});

module.exports = route;