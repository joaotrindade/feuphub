var request = require('request');
var Q = require('q');

run()

function run(){
	var classroom = process.argv[2]
	console.log("Searching class: "+classroom+"\n");
	find(classroom).then(getClassRoomInfo).then(getClassRoomTimetable).then(console.log).done();
}

function find(classroom){
	var deferred = Q.defer();
	getNumberFeupRooms().then(function(nRooms){
		return getFeupRoom(classroom, nRooms);
	}).then(deferred.resolve).catch(console.log).done();
	return deferred.promise;
}

function getNumberFeupRooms(){
	var deferred = Q.defer();

	request({
		url: "https://sigarra.up.pt/feup/pt/mob_instal_geral.pesquisa?pv_n_registos=1",
		method: 'GET',
		encoding:null
	}, function(error, response, body){
		if(error){
			getNumberFeupRooms().then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {
			deferred.resolve(JSON.parse(body).total);
		}
	});
	
	return deferred.promise;
}

function getFeupRoom(classroom, numberRooms){
	var deferred = Q.defer();
	
	var buidlingAcronymn = classroom.substring(0, 1).toUpperCase();
	var roomAcronymn = classroom.substring(1,classroom.length).toUpperCase();
	
	request({
		url: "https://sigarra.up.pt/feup/pt/mob_instal_geral.pesquisa?pv_n_registos="+numberRooms,
		method: 'GET',
		encoding:null
	}, function(error, response, body){
		if(error){
			getNumberFeupRooms().then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {
			var json = JSON.parse(body);
			for(var i=0;i<numberRooms;i++){
				if(json.resultados[i]['edificio_sigla']==buidlingAcronymn){
					if(json.resultados[i]['sigla']==roomAcronymn){
						deferred.resolve(json.resultados[i]);
						break;
					}
				}
			}
		}
	});
	
	return deferred.promise;
}

function getClassRoomInfo(classroom){
	var deferred = Q.defer();
	request({
		url: "https://sigarra.up.pt/feup/pt/mob_instal_geral.perfil?pv_sala_id="+classroom.id,
		method: 'GET',
		encoding:null
	}, function(error, response, body){
		if(error){
			getNumberFeupRooms().then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {
			var newJson = extend({}, classroom, JSON.parse(body));
			//console.log("New json:\n");
			//console.log(newJson);
			deferred.resolve(newJson);
		}
	});
	return deferred.promise;
}

function getClassRoomTimetable(classroom){

	var deferred = Q.defer();
	request({
		url: "https://sigarra.up.pt/feup/pt/mob_hor_geral.sala?pv_espaco_id="+classroom.id+"&pv_semana_ini=20140521&pv_semana_fim=20140522",
		method: 'GET',
		encoding:null
	}, function(error, response, body){
		if(error){
			console.log("Error! \n");
			console.log(error);
			deferred.reject();
		}else if( response.statusCode == 403){
			console.log("Error! ");
			console.log("Type: "+JSON.parse(body).erro+" -> "+JSON.parse(body).erro_msg+"\n");
			deferred.resolve(classroom);
		}else if (response.statusCode == 200) {
			var newJson = extend({}, classroom, JSON.parse(body));
			deferred.resolve(newJson);
		}
	});
	return deferred.promise;
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

//var object3 = extend({}, object1, object2);