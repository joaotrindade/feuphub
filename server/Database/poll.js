module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};

	api.post('/', function(req, res) {
	});
	
    return {api: api, start: start};
}(module || {}));