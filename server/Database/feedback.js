module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function insertFeedbacksByCourse(courseID,texto,userid,tagNome,callback){
		connection.query("INSERT INTO Feedback(upvote,downvote,texto,data,tag_nome,CursoKey,CadeiraKey,UtilizadorKey) VALUES (0,0,'" + texto + "',CURRENT_TIMESTAMP(),'" + tagNome + "','" + courseID + "'," + userid + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCourse(courseID,callback){
		connection.query("SELECT id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero WHERE Feedback.CursoKey like '" + courseID + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCourseLimit5(courseID,callback){
		connection.query("SELECT id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero WHERE Feedback.CursoKey like '" + courseID + "' ORDER BY difference desc LIMIT 5", function(err, results)
		{
			callback(err,results);
		});
	};
	
	api.post('/:courseID', function(req, res) {
		var cID = req.params.courseID;
		var body = req.body, type = body.type, type2 = body.type2;
			if(type=="curso") 
			{
				if(type2=="insert")
				{
					if (auth.validTokenProvided(req, res)) {
						var texto = req.body.texto;
						var userid = req.body.userid;
						var tagnome = req.body.tagnome; 
						insertFeedbacksByCourse(cID,texto,userid,tagnome,function(err,result) {
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
					}
				}
				else if(type2=="get5")
				{
					getFeedbacksByCourseLimit5(cID,function(err,result) {
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
				}
				else
				{
					getFeedbacksByCourse(cID,function(err,result) {
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
				}
			}
			else 
			{
			}
});
   
    return {api: api, start: start};
}(module || {}));
