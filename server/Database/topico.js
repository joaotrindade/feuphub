module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getTopicos(courseID,callback){
		connection.query("SELECT id,Topico.tipo,titulo,upvote-downvote as difference,texto,data,Topico.CursoKey,nome FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero WHERE Topico.CursoKey like '" + courseID + "'", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicoByID(tID,callback){
		connection.query("SELECT id,Topico.tipo,titulo,upvote-downvote as difference,texto,data,Topico.CursoKey,nome FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero WHERE Topico.id = " + tID + "", function(err, results)
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

	api.post('/id/:topicID', function(req, res) {
		var tID = req.params.topicID;
		getTopicoByID(tID,function(err,result) {
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
