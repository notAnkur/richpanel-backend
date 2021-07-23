const mongoose = require('mongoose');

const connect = () => {
	return new Promise((resolve, reject) => {
		mongoose.connect(process.env.MONGO_URL, {
	    useNewUrlParser: true,
	    useUnifiedTopology: true,
	    useFindAndModify: false
	  }).then((res, err) => {
	  	if(err) return reject(err);
	  	console.log("Connected to the database")
	  	resolve();
	  });
	})
}

const closeConnection = () => {
	return mongoose.disconnect();
}

module.exports = { connect, closeConnection }