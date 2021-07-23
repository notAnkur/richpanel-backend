const Conversation = require('../db/models/Conversation.model');
const ObjectId = require('mongoose').Types.ObjectId;

class ConversationService {
	constructor(logger) {
		this.logger = console;
	}

	async getConversations() {
		try {
			const conversations = await Conversation.find({}).exec();
			return conversations;
		} catch(error) {
			this.logger.error(`getConversations: ${error}`);
		}
	}

  async getConversationById(conversationId) {
    try {
			const conversation = await Conversation.findOne({ id: conversationId }).exec();
			return conversation;
		} catch(error) {
			this.logger.error(`getConversationById: ${error}`);
		}
  }

  async removeConversationsById(idArray) {
    try {
			await Conversation.deleteMany({ id: { $in: idArray}}, (err) => {
        if(err) {
          this.logger.error(err);
        }
      });
		} catch(error) {
			this.logger.error(`removeConversationsById: ${error}`);
		}
  }

  async insertConversation(convoData) {
    try {
			const newConvo = await Conversation.create({ ...convoData }).exec();
      console.log(newConvo)
      return newConvo;
		} catch(error) {
			this.logger.error(`insertConversation: ${error}`);
		}
  }

  async getMessengerMessagesByID(conversationId, senderId, recipientId) {
    const messages = await Conversation.find({ id: conversationId, profileId: senderId, recipientId, type: 'DM' }).exec();
    console.log(messages);
    return messages;
  }

  async upsertConversation(convoId, convoData) {
    try {
			const convo = await Conversation.findOneAndUpdate({ id: convoId }, convoData, {upsert: true}).exec();
      console.log(convo)
      return convo;
		} catch(error) {
			this.logger.error(`insertConversation: ${error}`);
		}
  }

}

module.exports = new ConversationService;