var Q = require('q');						//promises
var request = require('request');			//for proxy http requests
var cheerio = require('cheerio');			//Dom manipulation
var iconv = require('iconv-lite');
var util = require('util');					//redirect console log to file
var fs = require('fs');						//file utility

var urlAllCourses = "http://sigarra.up.pt/feup/pt/cur_geral.cur_inicio";

var allCourses = {
	url: 'http://sigarra.up.pt/feup/pt/cur_geral.cur_inicio',
    method: 'GET'
}

run();

function run(){
	try{
		fs.unlink('debug.log');
		var log_file = fs.createWriteStream('debug.log', {flags : 'w'});
		var log_stdout = process.stdout;
	}catch(err){}

	console.log = function(d) {
		log_file.write(util.format(d));
		log_stdout.write(util.format(d));
		return;
	};
	
	parseSigarra().then(saveInformation).then(updateDB).catch(console.log).done();
}

function parseSigarra()
{
	var deferred = Q.defer();

	console.log("Lets parse\n");	
	getCourses().then(function(results){
		deferred.resolve(results);	
	})
	return deferred.promise;

}

function saveInformation(results){
	var deferred = Q.defer();
	
	try{
			fs.unlink('data.json');
		}catch(err){}
		
		var json_file = fs.createWriteStream('data.json', {flags : 'w'});
		
		json_file.write(JSON.stringify(results,undefined, 2));
		deferred.resolve();
	
	return deferred.promise;
}

function updateDB()
{
	var deferred = Q.defer();
    
	var spawn = require('child_process').spawn;
	var prc = spawn('java',  ['-jar', 'FeupHubDB.jar']);

	//noinspection JSUnresolvedFunction
	prc.stdout.on('data', function (data) {
		var str = data.toString()
		var lines = str.split(/(\r?\n)/g);
		console.log(lines.join(""));
	});

	prc.on('close', function (code) {
		console.log('process exit code ' + code);
		deferred.resolve();
	});
	
	return deferred.promise;
}


function getCourses(){
	var deferred = Q.defer();
	// Start the request
	request(allCourses, function(error, response, body){
	if (!error && response.statusCode == 200) {
		    $ = cheerio.load(response.body);
			var urls = [];
			$('#MI_a li').map(function(i, link) {
				var href = $(link).find('a:first-child').attr('href');
				var url = 'http://sigarra.up.pt/feup/pt/'+href;
				urls.push(url);
			});
			
			getCourse = limitConcurrency(getCourse, 1);

			var coursePromises = urls.map(getCourse);
			
			Q.all(coursePromises).then(function (results) {
				deferred.resolve(results);
			});
			
		}
		else{
			console.log("falhou cursos:"+response.statusCode+", "+error+"\n");
			deferred.reject();
		}
	})
    return deferred.promise;
}

function getCourse(url){
	var deferred = Q.defer();
	//console.log("getCourse started : "+url+"\n");
	request({
		url: url,
		method: 'GET',
		encoding:null
	},function(error,response,body){
		if(error){
			console.log("getCourse: "+url+" failed\n");
			console.log("re-trying...\n");
			getCourse(url).then(function(promise){
				deferred.resolve(promise);
			});
		}
		else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			var curso = new Curso($('#conteudoinner').children()[2].children[0].data, $('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			var coursePlanUrl = 'http://sigarra.up.pt/feup/pt/' + $('.curso-informacoes div:nth-child(4) li a')[0].attribs.href;
			parseCoursePlan(coursePlanUrl,curso.sigla).then(function(data){
				console.log("Feito curso: "+curso.nome+"\n\n");
				curso.cadeiras = data;
				//console.log(JSON.stringify(curso,undefined, 2));
				//console.log("\n\n");
				deferred.resolve(curso);
			}).catch(function (error) {
				console.log("getCourse "+curso.sigla+" something went wrong!\n");
				console.log(error);
			}).done();	
		}});
	
    return deferred.promise;
}

function parseCoursePlan(coursePlanUrl, courseAcronym){
	var deferred = Q.defer();
		
	request({
		url: coursePlanUrl,
		method: 'GET',
		encoding: null
	},function(error,response,body){
		if(error){
			console.log("parseCoursePlan: "+coursePlanUrl+ " failed\n");
			console.log(error);
			console.log("\n");
			console.log("re-trying...\n");
			parseCoursePlan(coursePlanUrl, courseAcronym).then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			
			var curso = $('#conteudoinner > h1:nth-child(3)')[0].children[0].data;		
			
			var courseUnitsHref = [];
			
			// Todas as cadeiras obrigatórias de um curso
			$('div.caixa').children('table.dados').find('a[href^="ucurr"]').not($('h3').siblings('table.dados').find('a[href^="ucurr"]')).each(function(i,elem){			
				courseUnitsHref.push({'url':'http://sigarra.up.pt/feup/pt/' + $(this)[0].attribs["href"], "opcional":false});
			});
			
			//console.log("parseCoursePlan obrigatórias: "+($('div.caixa').children('table.dados').find('a[href^="ucurr"]').not($('h3').siblings('table.dados').find('a[href^="ucurr"]'))).length+"\n");

			// Só as cadeiras opcionais de um curso
			$('h3').siblings('table.dados').find('a[href^="ucurr"]').each(function(i,elem){			
				courseUnitsHref.push({'url':'http://sigarra.up.pt/feup/pt/' + $(this)[0].attribs["href"], "opcional":true});			
			});
		
			//console.log("parseCoursePlan opcionais: "+$('h3').siblings('table.dados').find('a[href^="ucurr"]').length+"\n");
			//console.log("parseCoursePlan total: "+courseUnitsHref.length+"\n\n");
		
			var courseUnitPromises = courseUnitsHref.map(function(a) {return parseCourseUnit(a,courseAcronym);});
			
			Q.all(courseUnitPromises).then(function (results) {
				//console.log("Cadeiras feitas\n");
				deferred.resolve(results);
			}).catch(function (error) {
				console.log("parseCoursePlan: "+coursePlanUrl.url+" ,something went wrong!\n");
				console.log(error);
				console.log("\n");
			}).done();
		}});
		
    return deferred.promise;
}

function parseCourseUnit(courseObj,courseAcronym)
{	
	var deferred = Q.defer();
	
	request({
		url: courseObj.url,
		method: 'GET',
		encoding: null,
		followAllRedirects: true
	},function(error,response,body){
		if(error){
			console.log("parseCourseUnit failed: \n");
			console.log(courseObj);
			console.log("\n");
			console.log(error);
			console.log("\n");
			console.log("re-trying...\n\n\n");
			parseCourseUnit(courseObj,courseAcronym).then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			if($('body').children().length ==0){
				parseCourseUnit({'url':$('a')[0].attribs["href"], "opcional":courseObj["opcional"]}, courseAcronym).then(function(promise){
					deferred.resolve(promise);
				});
			}else{
				var nome = $('#conteudoinner > h1:not([id])').text();
				var sigla = $('#conteudoinner > .formulario > tr > td:contains("Sigla") +td')[0].children[0].data;
				//console.log("Curso: "+courseAcronym+" -> Cadeira: "+nome+" "+sigla+" "+courseObj.url+"\n");
				var codigo = $('#conteudoinner > .formulario >tr > td:contains("C") + td')[0].children[0].data;
				
				var active = $('#conteudoinner > .formulario > tr > td:contains("Ativa?") +td')[0].children[0].data;
				var ativo=false;
				if(active=="Sim")
					ativo = true;
				var aux = $('#conteudoinner > h2').text();
				var semestre = aux.substring(aux.length-1,aux.length-2);
				var courseUnitAcroynm = $('h3:contains("Ciclos de Estudo/Cursos") + .dados > tr > .k.t > a');
				var courseUnitYears = $('h3:contains("Ciclos de Estudo/Cursos") + .dados  > tr >td:nth-child(4)');				
				var found = false;
				
				for(var i=0; i< courseUnitAcroynm.length;i++)
				{
					if(courseUnitAcroynm[i].children[0].data==courseAcronym){
						found = true;
						
						var ano = courseUnitYears[i].children[0].data;						
						
						//console.log(courseAcronym+" "+courseObj.url+ " nome: "+nome+", sigla: "+sigla+", codigo: "+codigo+", ano: "+ano+", semestre: "+semestre+", ativo: "+ativo+"\n");
						
						aux = $('.horas > .dados > tr >td > a[href*="func_geral"]');
						var teacherUrls = [];
						var n = courseObj.url.search("ucurr_geral");
						var substr = courseObj.url.substring(0,n);
						for(var j=0; j<aux.length; j++)
						{
							teacherUrls.push(substr+aux[j].attribs["href"]);
						}
												
						var teacherPromises = teacherUrls.map(function(a) {return parseTeacher(a);});
			
						Q.all(teacherPromises).then(function (results) {							
							if(courseObj.opcional){
								var cadeira = new Cadeira(nome, sigla, codigo, ano, semestre, ativo);
								cadeira.opcional = true;
								cadeira.profs = results;
								deferred.resolve(cadeira);
							}else{
								var courseId = courseObj.url.split("id=")[1];
								getBranch(courseId).then(function (result){
									var cadeira = new Cadeira(nome, sigla, codigo, ano, semestre, ativo);
									cadeira.opcional = false
									cadeira.ramo = result;
									cadeira.profs = results;
									deferred.resolve(cadeira);
								}).catch(function (error){
									console.log("parseCourseUnit: obrigatória "+courseAcronym+" -> "+courseObj.url+" ,something went wrong!\n");
									console.log(error);
									console.log("\n");
								});
							}
						}).catch(function (error) {
							console.log("parseCourseUnit: "+courseAcronym+" -> "+courseObj.url+" ,something went wrong!\n");
							console.log(error);
							console.log("\n");
						}).done();
						
						break;
					}
				}
				if(found)
					return;
				else{
				
					console.log("no match in "+courseObj.url+" of : "+courseAcronym+" in array of size: "+courseUnitAcroynm.length+"\n");
					for(var i=0; i< courseUnitAcroynm.length;i++)
					{
						console.log(courseUnitAcroynm[i].children[0].data+" vs "+courseAcronym+"\n");
					}
					
					console.log("falhou cadeira\n");
					deferred.reject();
				}
			}
		}
	});

    return deferred.promise;
}


function parseTeacher(teacherUrl){
	var deferred = Q.defer();
		
	request({
		url: teacherUrl,
		method: 'GET',
		encoding: null,
		followAllRedirects: true
	},function(error,response,body){
		if(error){
			console.log("parseTeacher: "+teacherUrl+ " failed\n");
			console.log(error);
			console.log("\n");			
			console.log("re-trying...\n");
			parseTeacher(teacherUrl).then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {			
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			var fotoUrl = $('.informacao-pessoal-dados-foto > img').attr('src');
			var nome = $('.informacao-pessoal-dados-dados > .tabela > tr:nth-child(1) > td:nth-child(2) > b').text();
			var codigo = $('.informacao-pessoal-dados-dados > .tabela > tr:nth-child(3) > td:nth-child(2)').text();

			var aux = fotoUrl.substring(0, 9);

			var res = fotoUrl;
			if(aux== "/feup/pt/")
				res=fotoUrl.substring(9,fotoUrl.length);
			
			var str = "https://sigarra.up.pt/feup/pt/" + res;
			var prof = new Professor(nome, codigo, str);
			deferred.resolve(prof);
			
		}
	});

    return deferred.promise;
}

function getBranch(courseCode)
{
	var deferred = Q.defer();
		
	request({
		url: "https://sigarra.up.pt/feup/pt/mob_ucurr_geral.info_pe_ocorr?pv_ocorrencia_id="+courseCode,
		method: 'GET',
		encoding: null,
		timeout: 120000,
		followAllRedirects: true
	},function(error,response,body){
		if(error){
			console.log("getBranch: "+courseCode+ " failed\n");
			console.log(error);
			console.log("\n");			
			console.log("re-trying...\n");
			getBranch(courseCode).then(function(promise){
				deferred.resolve(promise);
			});
		}else if (response.statusCode == 200) {
		    var info = JSON.parse(body);
			if(info.length==0){
				deferred.resolve("comum");
			}
			else if(info.length==1){
				deferred.resolve(info[0].ramo_nome);
			}else{
				var found = false;
				var i = 0;
				for(i; i < info.length;i++)
				{
					if(info[i].tipo != "OPC")
					{
						found = true;
						break;
					}
				}
				if(found)
					deferred.resolve(info[i].ramo_nome);
				else
					deferred.resolve("comum");
			}
		}
	});
    return deferred.promise;
}

function Curso(nome, sigla)
{
	this.nome = nome;
	this.sigla = sigla;
	this.cadeiras = new Array();
}

function Cadeira(nome, sigla, codigo, ano, semestre, ativo)
{
	this.nome = nome;
	this.sigla = sigla;
	this.codigo = codigo;
	this.ano = ano;
	this.semestre = semestre;
	this.ativo = ativo;
}

function Professor(nome,codigo,foto)
{
	this.nome = nome;
	this.codigo = codigo;
	this.foto = foto;
}

//Auxiliar functions
function limitConcurrency(promiseFactory, limit) {
  var running = 0,
      semaphore;
 
  function scheduleNextJob() {
    if (running < limit) {
      running++;
      return Q();
    }
 
    if (!semaphore) {
      semaphore = Q.defer();
    }
 
    return semaphore.promise
      .finally(scheduleNextJob);
  }
 
  function processScheduledJobs() {
    running--;
 
    if (semaphore && running < limit) {
      semaphore.resolve();
      semaphore = null;
    }
  }
 
  return function () {
    var _this = this,
        args = arguments;
 
    function runJob() {
      return promiseFactory.apply(_this, args);
    }
 
    return scheduleNextJob()
      .then(runJob)
      .finally(processScheduledJobs);
  };
}

