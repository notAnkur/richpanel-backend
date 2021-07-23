const route = require("express").Router();
const ConversationService = require("../Services/Conversation.service");
const User = require("../Services/User.service");
const {
  getPagesHelper,
  getPostsHelper,
  getTopLevelCommentsHelper,
  getAllSubComments,
  getCommentById,
  getPageAccessToken,
  getUserProfileInfo,
  postComment
} = require("../utils/helpers/conversation.helper");

const { verifyToken } = require("../utils/verifyToken");

/**
 * INFO:
 * I could use webhooks for page comments(page feed subscription) but apps in dev mode don't have access to "real" data from test pages
 * So, for page comments, I'm fetching posts and then enumerating over each of them to get the comments
 */

route.get('/', verifyToken, async (req, res) => {
  const { fbid } = req || {};
  const userDetails = await User.getUser(fbid);
  const { accessToken } = userDetails || {};
  const { data: pageData } = await getPagesHelper(fbid, accessToken);

  const freshConversations = [];

  // console.log(pageData)

  for(const page of pageData) {
    const {
      access_token: pageAccessToken,
      category,
      name: pageName,
      id: pageId
    } = page || {};
    const { data: postData } = await getPostsHelper(pageAccessToken, pageId);
    // console.log(postData)

    for(const post of postData) {
      const {
        created_time: createdAt,
        message,
        id: postId
      } = post || {};
      let { data: commentsData } = await getTopLevelCommentsHelper(pageAccessToken, postId);

      // add pageId to the top level comment
      commentsData.map(cd => cd['pageId'] = pageId);

      freshConversations.push(...commentsData);
    }
  }
  console.log(freshConversations)

  /**
   * The code below can be removed if this was a live FB app and webhooks were used
   * Below code loosly simulates if webhooks were used
   */

  // creating maps of live and db conversation data
  const dbConversations = await ConversationService.getConversations();

  const dbConversationsMap = new Map();
  const freshConversationsMap = new Map();
  const dbConversationsIDArr = [];
  const freshConversationsIDArr = [];

  for(const dbConvo of dbConversations) {
    const { id } = dbConvo || {};
    if(!dbConversationsMap.has(id)) {
      dbConversationsMap.set(id, dbConvo);
      dbConversationsIDArr.push(id);
    }
  }

  for(const fConvo of freshConversations) {
    const { id } = fConvo || {};
    if(!freshConversationsMap.has(id)) {
      freshConversationsMap.set(id, fConvo);
      freshConversationsIDArr.push(id);
    }
  }

  const removeIDArr = [];

  // collect ids to remove from db
  for(const dbConvoID of dbConversationsIDArr) {
    const convoObj = dbConversationsMap.get(dbConvoID);
    console.log(convoObj)
    if(!freshConversationsIDArr.includes(dbConvoID) && convoObj.type=="POST") {
      // remove from db
      removeIDArr.push(dbConvoID);
    }
  }

  await ConversationService.removeConversationsById(removeIDArr);

  // collect ids to add to db
  for(const fConvoID of freshConversationsIDArr) {
    if(!dbConversationsIDArr.includes(fConvoID)) {
      // add to db
      const convoData = freshConversationsMap.get(fConvoID);
      console.log("TEST -> ", convoData);
      const {
        id: convoId,
        message: convoMessage,
        from: author,
        created_time: createdAt,
        pageId
      } = convoData;
      const { name: profileName, id: profileId } = author;
      const newData = {
        id: convoId,
        message: convoMessage,
        type: 'POST',
        firstName: profileName.split(" ")[0],
        lastName: profileName.split(" ")[1],
        profileId,
        pageId: pageId,
        profilePic: ''
      };
      console.log(newData)
      await ConversationService.insertConversation(newData);
    }
  }

  // return updated data
  const conversations = await ConversationService.getConversations();
  res.json({conversations});
});


/**
 * Here also, I would have updated the comments(insert/remove/edit) using webhooks and served the data from the db
 * instead of fetching it directly from the FB Api
 */
route.post('/', verifyToken, async (req, res) => {
  const { conversationId, senderId, recipientId } = req.body || {};

  if(!conversationId || !senderId || !recipientId) {
    res.status(400).json({isLoggedIn: true, message: "bad payload"});
  }

  const { fbid } = req || {};
  const userDetails = await User.getUser(fbid);
  const { accessToken } = userDetails || {};

  const conversationDetails = await ConversationService.getConversationById(conversationId);
  console.log(conversationDetails)

  const { type } = conversationDetails || {};

  if(type == "POST") {
    const { pageId } = conversationDetails || {};

    const pageDetails = await getPageAccessToken(pageId, accessToken);

    const { access_token: pageAccessToken } = pageDetails || {};

    const subConversations = await getAllSubComments(pageAccessToken, conversationId);

    const { data: subConvoDataRaw } = subConversations || {};

    const subConvoDataFormatted = [];
    const userMap = new Map();

    for(const sConvo of subConvoDataRaw) {
      const {
        id: convoId,
        message: convoMessage,
        from: author,
        created_time: createdAt
      } = sConvo;
      const { name: profileName, id: profileId } = author;

      if(!userMap.has(profileId)) {
        const userinfo = await getUserProfileInfo(pageAccessToken, profileId);
        userMap.set(profileId, userinfo);
      }

      const user = userMap.get(profileId);
      const {
        first_name: firstName,
        last_name: lastName,
        profile_pic: profilePic,
        name
      } = user || {};

      const newData = {
        id: convoId,
        message: convoMessage,
        type: 'POST',
        firstName: firstName || name.split(" ")[0],
        lastName: lastName || name.split(" ")[0],
        profileId,
        pageId: pageId,
        profilePic: profilePic || "",
        createdAt
      };

      subConvoDataFormatted.push(newData);
      // upsert it in the db
      await ConversationService.upsertConversation(convoId, newData);
    }

    // add original toplevel to the top of the response array
    subConvoDataFormatted.unshift(conversationDetails);

    res.json({ conversations: subConvoDataFormatted }).status(200);
  } else if(type == "DM") {
    // TODO: handle Messenger messages here
    const messages = await ConversationService.getMessengerMessagesByID(conversationId, senderId, recipientId);
    res.json({ conversations: messages }).status(200);
  }
});

route.post('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params || {};
  const { message } = req.body || {};

  if(!conversationId || !message) {
    res.status(400).json({isLoggedIn: true, message: "bad param or empty body"});
  }

  const { fbid } = req || {};
  const userDetails = await User.getUser(fbid);
  const { accessToken } = userDetails || {};

  const conversationDetails = await ConversationService.getConversationById(conversationId);

  const { pageId } = conversationDetails || {};

  const pageDetails = await getPageAccessToken(pageId, accessToken);
  const { access_token: pageAccessToken } = pageDetails || {};

  const newComment = await postComment(pageAccessToken, conversationId, message);

  const commentData = await getCommentById(pageAccessToken, newComment.id);

  const {
    id: newConversationId,
    message: convoMessage,
    from: author,
    created_time: createdAt
  } = commentData || {};
  const { name: profileName, id: profileId } = author;

  const userinfo = await getUserProfileInfo(pageAccessToken, profileId);

  const {
    first_name: firstName,
    last_name: lastName,
    profile_pic: profilePic,
    name
  } = userinfo || {};

  const newData = {
    id: newConversationId,
    message: convoMessage,
    type: 'POST',
    firstName: firstName || name.split(" ")[0],
    lastName: lastName || name.split(" ")[0],
    profileId,
    pageId: pageId,
    profilePic: profilePic || "",
    createdAt
  };
  // upsert it in the db
  await ConversationService.upsertConversation(newConversationId, newData);

  res.json({ newComment: newData }).status(200);
});

module.exports = route;