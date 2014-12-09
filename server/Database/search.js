/*
Search:
- Tópico: titulo
- Curso: nome & sigla
- Cadeira: nome & sigla 
*/

module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function searchInDatabase(string, username){
		var deferred = Q.defer();

		var regex = /[a-z]+/gi;
		var array = string.match(regex);

		var searchResult = {};
		if(username){
			searchTopicoAutenticado(array,username).then(function (result){
				searchResult['topicos']=result; 
				return searchCurso(array);
			}).then(function (result){
				searchResult['cursos']=result; 
				return searchCadeiraAutenticado(array,username);		
			}).then(function(result){
				searchResult['cadeiras']=result;
				deferred.resolve(searchResult);
			}).catch(console.log).done();
		}else{
			searchTopico(array).then(function (result){
				searchResult['topicos']=result; 
				return searchCurso(array);
			}).then(function (result){
				searchResult['cursos']=result; 
				deferred.resolve(searchResult);
			}).catch(console.log).done();
		}
		return deferred.promise;
	}
	
	function searchTopicoAutenticado(array, username){
		//nao falta parte nao autenticada?
		var deferred = Q.defer();
		var stringQuery = "SELECT `id`,`titulo` From `Topico` INNER JOIN `CadeirasConcluidas` ON `CadeirasConcluidas.CadeiraKey`=`Topico.CadeiraKey` WHERE `CadeirasConcluidas.UtilizadorKey`= ' "+username+"'";
		for(var i=0; i<array.length;i++)
		{
			if(i+1==array.length){
				stringQuery += "`titulo` like '%"+array[i]+"%'";			
			}else{
				stringQuery += "`titulo` like '%"+array[i]+"%' OR ";
			}
		}
		
		//console.log("searchTopicoAutenticado: "+stringQuery);
		//console.log("\n");
		
		connection.query(stringQuery, function(err, result){
			if(!err){
				//console.log(result);
				//console.log("\n\n");
				deferred.resolve(result);	
			}
		});

		return deferred.promise;
	}

	function searchCadeiraAutenticado(array,username){
		var deferred = Q.defer();
		var stringQuery = "SELECT `sigla`, `nome` FROM `Cadeira` INNER JOIN `CadeirasConcluidas` ON `CadeirasConcluidas.CadeiraKey`=`Cadeira.codigo` WHERE `CadeirasConcluidas.UtilizadorKey`= ' "+username+"'";
		
		for(var i=0; i<array.length;i++)
		{
			if(i+1==array.length){
				stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%';";
			}else{
				stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%' OR ";
			}
		}
		
		//console.log("searchCadeiraAutenticado: "+stringQuery);
		//console.log("\n");
		
		connection.query(stringQuery, function(err, result){
			if(!err){
				//console.log(result);
				//console.log("\n\n");
				deferred.resolve(result);	
			}
		});
		
		return deferred.promise;
	}
	
	function searchTopico(array){
	
		var deferred = Q.defer();
		var stringQuery = "Select `id`,`titulo` From Topico Where ";
		
		for(var i=0; i<array.length;i++)
		{
			if(i+1==array.length){
				stringQuery += "`titulo` like '%"+array[i]+"%';";			
			}else{
				stringQuery += "`titulo` like '%"+array[i]+"%' OR ";
			}
		}
				
		//console.log("searchTopico: "+stringQuery);
		//console.log("\n");
		
		connection.query(stringQuery, function(err, result){
			if(!err){
				//console.log(result);
				//console.log("\n\n");
				deferred.resolve(result);
			}
		});
		
		return deferred.promise;
	}

	function searchCurso(array){
		
		var deferred = Q.defer();
		var stringQuery = "Select * From Curso Where ";
		
		for(var i=0; i<array.length;i++)
		{
			if(i+1==array.length){
				stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%';";
			}else{
				stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%' OR ";
			}
		}
		
		//console.log("searchCurso: "+stringQuery);
		//console.log("\n");

		connection.query(stringQuery, function(err, result){
			if(!err){
				//console.log(result);
				//console.log("\n\n");
				deferred.resolve(result);	
			}
		});
		return deferred.promise;
	}
	
	api.post('/', function(req, res) {
		var body = req.body, username = body.type, string = body.query;		

		if (auth.validTokenProvided(req, res)) {
			searchInDatabase(string, username).then(function(searchResult){
				res.send({
					success: true,
					results: searchResult
				});
			}).catch(function(err){
				res.send({
					success: false,
					results: err
				});
			});
		}
		else{
			searchInDatabase(string).then(function(searchResult){
				res.send({
					success: true,
					results: searchResult
				});
			}).catch(function(err){
				res.send({
					success: false,
					results: err
				});
			});
		}
	});
	
    return {api: api, start: start};
}(module || {}));