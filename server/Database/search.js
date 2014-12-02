module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function searchInDatabase(string){
		var deferred = Q.defer();

		var regex = /[a-z]+/gi;
		var array = string.match(regex);

		var searchResult = [];
		
		searchTopico(array).then(function(result){
			searchResult['topicos']=result; searchCurso(array);
		}).then(function(result){
			searchResult['cursos']=result; searchCadeira(array);
		}).then(function(result){
			searchResult['cadeiras']=result; deferred.resolve(searchResult);
		}).catch(console.log).done();
		
		return deferred.promise;
	}

	function searchTopico(array){
		var deferred = Q.defer();
		var stringQuery = "Select * From Topico Where ";
		
		for(var i=0; i<array.length;i++)
		{
			if(i+1==array.length){
				stringQuery += "`titulo` like '%"+array[i]+"%';";			
			}else{
				stringQuery += "`titulo` like '%"+array[i]+"%' OR ";
			}
		}
		
		console.log("searchTopico: "+stringQuery);
		
		query(stringQuery, function(err, result){
			if(!err){
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
		
		console.log("searchCurso: "+stringQuery);
		
		query(stringQuery, function(err, result){
			if(!err){
				deferred.resolve(result);	
			}
		});
		return deferred.promise;
	}

	function searchCadeira(array){
		var deferred = Q.defer();
		var stringQuery = "Select * From Cadeira Where ";
		
		for(var i=0; i<array.length;i++)
		{
			if(i+1==array.length){
				stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%';";
			}else{
				stringQuery += "`nome` like '%"+array[i]+"%' OR `sigla` like '%"+array[i]+"%' OR ";
			}
		}
		
		console.log("searchCadeira: "+stringQuery);
		
		query(stringQuery, function(err, result){
			if(!err){
				deferred.resolve(result);	
			}
		});
		return deferred.promise;
	}
	
	api.post('/', function(req, res) {
		if (auth.validTokenProvided(req, res)) {
		}
		else{
			res.send("not allowed");
		}
    });
	
	api.get('/:codigo', function(req, res) {
    });
	
    return {api: api, start: start};
}(module || {}));


/*
Search:
- Tópico: titulo
- Curso: nome & sigla
- Cadeira: nome & sigla 
*/