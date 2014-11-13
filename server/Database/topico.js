module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getTopicos(courseID,callback){
		connection.query("SELECT id,topico.tipo,titulo,upvote-downvote as difference,texto,data,topico.CursoKey,utilizador.nome FROM topico inner join utilizador on topico.UtilizadorKey = utilizador.numero WHERE topico.CursoKey like '" + courseID + "'", function(err, results)
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
