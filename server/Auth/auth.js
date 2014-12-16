module.exports = (function() {
    'use strict';
    var api = express.Router();
	var currentToken;
	
	api.post('/authenticate', function(req, res) {

	  var body = req.body,
		  username = body.username,
		  password = body.password,
		  loginSuccess = body.loginSuccess;
		  
		  
	  if (loginSuccess=="able") {
		// Generate and save the token (forgotten upon server restart).
		currentToken = 'da39a3ee5e6b4b0d3255bfef95';
		res.send({
		  success: true,
		  token: currentToken
		});
	  } else {
		res.send({
		  success: false,
		  message: 'Something went wrong'
		});
	  }
	});

	function validTokenProvided(req, res) {
		// Check POST, GET, and headers for supplied token.
		var userToken = req.body.token || req.param('token') || req.headers.token;

		if (!currentToken || userToken != currentToken) {
			res.status(401).send({ error: 'Invalid token. You provided: ' + userToken });
			//res.send(401, { error: 'Invalid token. You provided: ' + userToken });
			return false;
		}
		return true;
	}
	
	function isValid(req){
		var userToken = req.body.token || req.param('token') || req.headers.token;

		if (!currentToken || userToken != currentToken) {
			return false;
		}
		return true;
	}
	
    return {api: api, validTokenProvided: validTokenProvided, isValid: isValid};
}(module || {}));
