module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function updateNickname(idUser,nickname,callback) {
		connection.query("SELECT id FROM Visitante INNER JOIN Utilizador ON Visitante.id = Utilizador.VisitanteKey WHERE numero=" + idUser, function(err, results)
		{
			connection.query("UPDATE Visitante SET nickname='" + nickname + "' WHERE id=" + results[0].id, function(err, results2)
			{
				callback(err,results);
			});
		});
	};
	
	function checkExists(numero, callback){
		connection.query("SELECT count(*) as NOcorrencias FROM Utilizador where numero = " + numero, function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getUser(numero,callback){
		connection.query("SELECT * FROM Visitante INNER JOIN Utilizador ON Visitante.id = Utilizador.VisitanteKey WHERE Utilizador.numero=" + numero, function(err, results)
		{
			callback(err,results);
		});
	};
	
	function needsUpdate(userid,callback){
		connection.query("SELECT TIMEDIFF( (SELECT lastUpdateDate from Utilizador where numero = " + userid + "), (SELECT data from Status where status=1) ) < 0 as Response", function(err, results)
		{
			callback(err,results);
			//return (results[0].Response);
		});
	};
	
	function updateUserTimeStamp(userid)
	{
		connection.query("Update Utilizador SET lastUpdateDate = CURRENT_TIMESTAMP where numero =" + userid, function(err, results)
		{
		
		});
	}
	
	var contador = 0;
	var loopArray = function(userid,arr,callback) {
    insertCadeiraConcluida(userid,arr[contador],function(){
        // set x to next item
        contador++;

        // any more items in array? continue loop
        if(contador < arr.length) {
            loopArray(userid,arr,callback);   
        }
		else
		{
			callback();
		}
		}); 
	}
		
	function insertCadeiraConcluida(userid, cadeira, callback) {
		
		var select1 = "SELECT count(*) as Existe from Cadeira where codigo = '" + cadeira.ucurr_codigo+ "'";
		var select2 = "SELECT count(*) as Existe from CadeirasConcluidas where CadeiraKey = '"+ cadeira.ucurr_codigo + "' and UtilizadorKey = " + userid ;
		var insert1 = "INSERT INTO CadeirasConcluidas(CadeiraKey,UtilizadorKey) VALUES ('" + cadeira.ucurr_codigo+"'," + userid +")";
		
		connection.query('SELECT count(*) as Existe from Cadeira where codigo = "' + cadeira.ucurr_codigo+'"' , function(err3, results3)
		{
			if(!err3 && results3[0].Existe > 0)
			{
				connection.query(select2, function(err4, results4)
				{
					if (!err4 && results4[0].Existe == 0)
					{
						connection.query(insert1,function(err5,results5)
						{
							callback();
						});
					}
					else
					{	
						callback();
					}
				});
			}
			else
			{
				callback();
			}
		});
	
	}
	
	function createUser(userid, data, callback) {
		var id_visitante;
		var object = JSON.parse(data);
		var id_curso = object[0].cur_sigla;
		var cadeiras = object[0].inscricoes;
		var insert1;
		var select2;
		var select1;
		
		connection.query("INSERT INTO Visitante(nickname) VALUES(" + userid + ")", function(err1, result1)
		{
			if (!err1)
			{
				id_visitante = result1.insertId;
				connection.query("INSERT INTO Utilizador(numero,tipo,nome,CursoKey,VisitanteKey) VALUES(" + userid + ",1," + "'no_name'" + ",'" + id_curso + "'," + id_visitante +")", function(err2, result2)
				{
					if (!err2)
					{
						updateUser(userid,cadeiras,callback)
					}
					else
					{
						callback(true,err2);
					}
				});
			}
			else
			{
				callback(true,err1);
			}
			
		});

		
	}
	
	function updateUser(userid,data,callback){
		contador = 0;
		loopArray(userid,data, function(){
			updateUserTimeStamp(userid);
			callback(false,false);
		});
	};
	
	api.post('/updateUser', function(req,res){
		var userId = req.body.userId;
		var courseData = req.body.courseData;
		var object = JSON.parse(courseData);
		var cadeiras = object[0].inscricoes;
		updateUser(userId,cadeiras,function(err,result)
		{
			if (err)
			{
				res.send({
					success: false,
					results: err
				});
			}
			else
			{
				res.send({
					success: true
				});
			}
		});
		
	});
	
	api.get('/exists/:userid', function(req, res) {
		var userid = req.params.userid;
		checkExists(userid, function(err, results)
		{
			if (err)
			{
				res.send({
						success: false,
						exists: false,
						results: err
				});
			}
			else
			{
				if (results[0].NOcorrencias == 0)
				{
					res.send({
						success: true,
						exists: false,
						results: err
					});
				}
				else
				{
					res.send({
						success: true,
						exists: true,
						results: err
					});
				}
			}
		});
	});
	
	api.get('/needsUpdate/:userid', function(req, res) {
		var userid = req.params.userid;
        needsUpdate(userid,function(err, results)
		{
			if(err)
			{
				res.send({
					success: false,
					result: err
				});
			}
			else
			{
				if(results[0].Response == 1)
				{	
					res.send({
						success: true,
						result: true
					});
				}
				else
				{
					res.send({
						success: true,
						result: false
					});
				}
			}
		});
    });
	
	api.post('/insertNewUser', function(req, res) {
		var userId = req.body.userId;
		var courseData = req.body.courseData;
		createUser(userId,courseData,function(err,result)
		{
			if(err)
			{
				res.send({
					success: false,
					results: err
				});
			}
			else
			{				
				res.send({
					success: true
				});
			}
		});
	});
	
	api.post('/', function(req, res) {
	var body = req.body, numero = body.numero;
	if (auth.validTokenProvided(req, res)) {
		getUser(numero,function(err,result) {
			if(err)
			{
				res.send({
					success: false,
					results: err
				});
			}
			else {
				res.send({
					success: true,
					results: result
				});
			}
		});
	}
});

	api.post('/:idUser', function(req, res) {
	var numero = req.params.idUser;
	var body = req.body, type=body.type, alterar=body.valor;
	if (auth.validTokenProvided(req, res)) {
		if(type=="nickname") {
			updateNickname(numero,alterar,function(err,result) {
				if(err)
				{
					res.send({
						success: false,
						results: err
					});
				}
				else {
					res.send({
						success: true,
						results: result
					});
				}
			});
		}
		else if(type=="email")
		{
			updateEmail(numero,alterar,function(err,result) {
				if(err)
				{
					res.send({
						success: false,
						results: err
					});
				}
				else {
					res.send({
						success: true,
						results: result
					});
				}
			});
		}
	}
});
   
    return {api: api, start: start};
}(module || {}));
