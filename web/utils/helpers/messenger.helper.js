const fetch = require('node-fetch');

const getMessengerProfileInfo = async (userId, accessToken) => {
  const userinfo = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${userId}?access_token=${accessToken}`)
                .then(res => res.json());
  return userinfo;
};

const sendResponse = async (pageAccessToken, recipientId, message) => {
  const responseBody = {
    messaging_type: "RESPONSE",
    recipient: { id: recipientId },
    message: { text: message }
  };
  const response = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/me/messages?access_token=${pageAccessToken}`, {
    method: 'POST',
    body: JSON.stringify(responseBody),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json());
  return response;
};

module.exports = {
  getMessengerProfileInfo,
  sendResponse
};