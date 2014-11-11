
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
			
			var coursePromises = urls.map(getCourse);

			Q.all(coursePromises).then(function(courses){
				deferred.resolve(courses);
			});
		}
		else{
			deferred.reject();
		}
		allCourses.url = urlAllCourses;
	})
    return deferred.promise;
}

function getCourse(url){
	var deferred = Q.defer();

	request({
		url: url,
		method: 'GET',
		headers: headers,
	},function(error,response,body){
		if(error){
			console.log("getCourse failed");
			deferred.reject();
		}
		else if (response.statusCode == 200) {
			$ = cheerio.load(body);
			var course = new Curso($('#conteudoinner').children()[2].children[0].data,$('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			var urlCourseUnits = 'http://sigarra.up.pt/feup/pt/' + $('.curso-informacoes div:nth-child(4) li a')[0].attribs.href;
			getCourseUnits(urlCourseUnits).then(getCourseUnitTeachers).then(function(){deferred.resolve(course);}).done();	
		}});
	
    return deferred.promise;
}

function getCourseUnits(urlCourseUnits){
	var deferred = Q.defer();
		
	request({
		url: urlCourseUnits,
		method: 'GET',
		headers: headers,
	},function(error,response,body){
		if(error){
			console.log("getCourseUnits failed");
			deferred.reject();
		}else if (response.statusCode == 200) {
			$ = cheerio.load(body);
			
			//most generic case
			var curso = $('#conteudoinner > h1:nth-child(3)')[0].children[0].data;
			var year = $('div[id*="ano_"]:not([id*="div_percursos"]) > table');			
			
			var log_file = fs.createWriteStream('debug.log', {flags : 'w'});
			var log_stdout = process.stdout;
		
			console.log = function(d) { //
			  log_file.write(util.format(d));
			  log_stdout.write(util.format(d));
			  return;
			};
						
			console.log(curso+"\n");
			var parseYearPromises = [0,1,2,3,4].map(function(a) {return parseYear(body,a);});
			/*
			for(i=0; i<year.length;i++)
			{
				parseYearPromises.push(parseYear(body,i));
			}*/
			
			Q.all(parseYearPromises).then(function(){
				deferred.resolve(3);
			});

			console.log("\n");
			deferred.resolve(3);
		}});
		
    return deferred.promise;
}

function getCourseUnitTeachers(courseUnit){
	var deferred = Q.defer();
	//console.log(courseUnit);
	deferred.resolve(2);
    return deferred.promise;
}

function parseCourses(array)
{
	var ar = new Array();
	var arrayLength = array.length;
	for (var i = 0; i < arrayLength; i++) {
    request({
		url: array[i],
		method: 'GET',
		headers: headers,
	},function(error,response,body){
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			ar.push({ url: url, Course: new Course($('#conteudoinner').children()[2].children[0].data,$('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data)});
			//array[i]['Course'] = 1;// new Course($('#conteudoinner').children()[2].children[0].data,$('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			return;
		}});
	}
	console.log(ar);
	return;
}

function Curso(nome, sigla)
{
	this.nome = nome;
	this.sigla = sigla;
	this.plano = new Array();
}

function Semestre(ano, semestre, tronco)
{
	this.nome = nome;
	this.semestre = semestre;
	this.tronco = tronco;
}

function Tronco(tipo)
{
	this.tipo = tipo;
	this.cadeiras = new Array();
}

function Cadeira(nome, sigla, codigo, optativa)
{
	this.nome = nome;
	this.sigla = sigla;
	this.codigo = codigo;
	this.optativa = optativa;
	this.profs = new Array();
}

function Professor(nome,codigo)
{
	this.nome = nome;
	this.codigo = codigo;
}

function parseYear(html, year) //parses html for year
{
	console.log("parsing ano: "+(year+1)+"\n");
	var deferred = Q.defer();
	$ = cheerio.load(html);
	
	var yearData = $('div[id*="ano_"]:not([id*="div_percursos"]) > table ')[year];
	var aux = yearData.find('tr');
	console.log(aux);
	console.log("\t");
	var informationDivs = new Array();
	try{
		console.log(yearData.name+": ");
		console.log(yearData.attribs);
		console.log(" child len: "+yearData.children.length);
		console.log("\n");
		for(i=0; i<yearData.children.length;i++){ //remove wierd children
			if(yearData.children[i].type == 'tag'){
				//console.log("\t\t");
				//console.log(yearData.children[i].name);
				//console.log(" "+yearData.children[i].type);
				informationDivs.push(yearData.children[i]);
				//console.log("\n");
			}
		}
		var att;
		informationDivs.forEach(function(entry)
		{
			console.log("\t\t"+entry.name);
			att = entry.find("table").attribs;
			console.log(att);
			console.log("\n");
		});
		
		
	}catch(err){
		console.log("here: "+err);
		//console.log(yearData);
	}
	
	console.log("\n");		
	deferred.resolve(3);

	return deferred.promise;
}
