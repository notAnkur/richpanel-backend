const User = require('../db/models/User.model');
const ObjectId = require('mongoose').Types.ObjectId;

class UserService {
	constructor(logger) {
		this.logger = console;
	}

	async getUser(userId) {
		try {
			const user = await User.findOne({fbid: userId}).exec();
			return user;
		} catch(error) {
			this.logger.error(`getUser: ${error}`);
		}
	}

	async createUser(userDetails) {
		try {
			const newUser = new User({ ...userDetails });
			newUser.save();
			return newUser;
		} catch(error) {
			this.logger.error(`createUser: ${error}`)
		}
	}

	async updateUser(userId, editUser) {
		try {
			console.log(editUser)
			const editedUser = await User.findOneAndUpdate(
				{ _id: ObjectId(userId) },
				{ ...editUser },
				{ new: true }
			).exec();
			return editedUser;
		} catch(error) {
			this.logger.error(`updateUser: ${error}`);
		}
	}

}

module.exports = new UserService;