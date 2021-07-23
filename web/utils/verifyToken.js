const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
	const bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== "undefined") {
		const bearer = bearerHeader.replace(/^JWT\s/, ``).split(" ");
		const bearerToken = bearer[1].replace(/^"(.*)"$/, "$1");
		req.token = bearerToken;
		jwt.verify(bearerToken, process.env.JWT_SECRET, (err, response) => {
			if(err) console.log(err);
			if(response) {
				req.fbid = response.fbid;
				next();
			} else {
				res.status(403).json({isLoggedIn: false, message: "Invalid token"});
			}
		});
	} else {
		res.status(400).json({isLoggedIn: false, message: "Invalid token"});
	}
}

exports.verifyToken = verifyToken;