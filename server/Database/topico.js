module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getTopicos(courseID,callback){
		connection.query("SELECT * FROM Topico WHERE CursoKey like '" + courseID + "'", function(err, results)
		{
			callback(err,results);
		});
	};
	
	api.post('/:courseID', function(req, res) {
		var cID = req.params.courseID;
		getTopicos(cID,function(err,result) {
			if(err)
			{
				console.log(err);
				res.send({
					success: false,
					results: err
				});
			}
			else {
				console.log(result);
				res.send({
					success: true,
					results: result
				});
			}
		});
});
   
    return {api: api, start: start};
}(module || {}));
