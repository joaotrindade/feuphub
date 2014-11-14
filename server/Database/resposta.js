module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function addOne(idn,texton,datan,user_id,callback){
		connection.query("INSERT INTO resposta2(id,texto,data,userid) VALUES(" + idn + ",'" + texton + "','" + datan + "','" + user_id + "')", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getRespostas(tID,callback){
		connection.query("SELECT id,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,nome FROM Resposta inner join Utilizador on Resposta.UtilizadorKey = Utilizador.numero WHERE TopicoKey = " + tID + "", function(err, results)
		{
			callback(err,results);
		});
	};
	
	api.post('/', function(req, res) {
	if (auth.validTokenProvided(req, res)) {
		var id = req.body.id_questao;
		var texto = req.body.texto;
		var data = req.body.data;
		var user_id = req.body.userid;
		addOne(id,texto,data,user_id,function(err,result) {
			if(err)
			{
				console.log(err);
				res.send({
					success: false
				});
			}
			else {
				console.log(result);
				res.send({
					success: true
				});
			}
		});
	}
});

api.post('/:topicID', function(req, res) {
		var tID = req.params.topicID;
		getRespostas(tID,function(err,result) {
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
