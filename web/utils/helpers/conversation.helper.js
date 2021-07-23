const fetch = require('node-fetch');

const getPagesHelper = async (fbiD, accessToken) => {
  const pages = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${fbiD}/accounts?access_token=${accessToken}`)
                .then(res => res.json());
  return pages;
};

const getPostsHelper = async (pageAccessToken, pageId) => {
  // published_posts
  const posts = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${pageId}/published_posts?access_token=${pageAccessToken}`)
                .then(res => res.json());
  return posts;
};

const getTopLevelCommentsHelper = async (pageAccessToken, postId) => {
  // top level comments
  const comments = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${postId}/comments?access_token=${pageAccessToken}`)
                  .then(res => res.json());
  return comments;
};

const getPageAccessToken = async(pageId, accessToken) => {
  const pageDetails = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${pageId}?fields=access_token&access_token=${accessToken}`)
                      .then(res => res.json());
  return pageDetails;
};

const getAllSubComments = async (pageAccessToken, commentId) => {
  // sub comments
  const comments = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${commentId}/comments?filter=stream&access_token=${pageAccessToken}`)
                  .then(res => res.json());
  return comments;
};

const getCommentById = async (pageAccessToken, commentId) => {
  const comment = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${commentId}?access_token=${pageAccessToken}`)
                  .then(res => res.json());
  return comment;
}

const getUserProfileInfo = async (pageAccessToken, userId) => {
  const userinfo = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${userId}?access_token=${pageAccessToken}`)
                  .then(res => res.json());
  return userinfo;
};

const postComment = async (pageAccessToken, commentId, message) => {
  const newCommentData = await fetch(`${process.env.FACEBOOK_GRAPH_API_URL}/${commentId}/comments?access_token=${pageAccessToken}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json());

  console.log(newCommentData)
  return newCommentData;
};

module.exports = {
  getPagesHelper,
  getPostsHelper,
  getTopLevelCommentsHelper,
  getAllSubComments,
  getCommentById,
  getPageAccessToken,
  getUserProfileInfo,
  postComment
};