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
	
	function searchInDatabase(string, authenticated){
		var deferred = Q.defer();

		var regex = /[a-z]+/gi;
		var array = string.match(regex);

		var searchResult = {};
		
		searchTopico(array,authenticated).then(function (result){
			searchResult['topicos']=result; 
			return searchCurso(array);
		}).then(function (result){
			searchResult['cursos']=result; 
			return searchCadeira(array,authenticated);
		}).then(function(result){
			searchResult['cadeiras']=result;
			deferred.resolve(searchResult);
		}).catch(console.log).done();
		
		return deferred.promise;
	}

	function searchTopico(array, authenticated){
	
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
		var authenticatedResults = [];
		
		if(authenticated){
			//get user cadeiras
			//for each check the topic.title where cadeira.key = user.cadeira.key
			var userCadeiras = "SELECT `CadeiraKey` FROM `CadeirasConcluidas` WHERE `UtilizadorKey` = '"+authenticated+"'";
			connection.query(userCadeiras, function(err,result){
				if(err)
					deferred.reject();
				else{
					result.forEach(function(cadeiraKey){
						var topicos = "Select `id`,`titulo` From Topico Where `CadeiraKey` = '"+cadeiraKey+"'";
						if(array.length > 0){
							topicos +=" AND "
							for(var i=0; i<array.length;i++)
							{
								if(i+1==array.length){
									topicos += "`titulo` like '%"+array[i]+"%'";			
								}else{
									topicos += "`titulo` like '%"+array[i]+"%' OR ";
								}
							}
						}
						topicos +=";";
						connection.query(topicos, function(err,result){
							if(!err){
								authenticatedResults.push.apply(authenticatedResults,result);
							}
						});
					});
				}
			});
		}
		
		
		//console.log("searchTopico: "+stringQuery);
		//console.log("\n");
		
		connection.query(stringQuery, function(err, result){
			if(!err){
				//console.log(result);
				//console.log("\n\n");
				result.push.apply(result,authenticatedResults);
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

	function searchCadeira(array, authenticated){
		
		var deferred = Q.defer();
		if(authenticated){
			var authenticatedResults = [];
			var stringQuery;
			var userCadeiras = "SELECT `CadeiraKey` FROM `CadeirasConcluidas` WHERE `UtilizadorKey` = '"+authenticated+"'";
			connection.query(userCadeiras, function(err,result){
				if(err)
					deferred.reject();
				else{
					result.forEach(function(cadeiraKey){
					stringQuery = "Select `sigla`,`nome` From Cadeira Where `codigo` = '"+cadeiraKey+"'";
					if(array.length > 0){
						stringQuery +=" AND "
						for(var i=0; i<array.length;i++)
						{
							if(i+1==array.length){
								stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%';";
							}else{
								stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%' OR ";
							}
						}
					}
					stringQuery +=";";

					connection.query(stringQuery, function(err, result){
						if(!err){
							//console.log(result);
							//console.log("\n\n");
							authenticatedResults.push.apply(authenticatedResults,result);
						}
					});
					});
				}
			});
			deferred.resolve(result);	
			//console.log("searchCadeira: "+stringQuery);
			//console.log("\n");

		}
		else{
			deferred.resolve([]);
		}
		
		return deferred.promise;
	}
	
	api.post('/', function(req, res) {
		var body = req.body, username = body.type, string = body.query;		

		if(username) //username defined
		{
			console.log(username);
			if (auth.validTokenProvided(req, res)) {
				
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
		}
		else{
			searchInDatabase(string).then(function(searchResult){
				res.send({
					success: true,
					response: searchResult
				})
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