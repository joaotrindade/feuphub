https = require('https'); 
express = require('express');
cookieParser = require('cookie-parser');
bodyParser = require('body-parser');
request = require('request');			//for proxy http requests
fs = require('fs');						//ssl certificates
path = require('path');					//static directory
request = require('request');			//for proxy http requests
cheerio = require('cheerio');			//Dom manipulation
Q = require('q');						//promises
app = express();						// define our app using express
// convert utf8-iso 8859
iconv = require('iconv-lite');
util = require('util');					//redirect console log to file

database = require("./server/Database/database");
sigarra = require("./server/Sigarra/sigarra");
auth = require("./server/Auth/auth");

//Testing arguments

if(process.argv.length == 2){
	app.set('ENV', "development");
	/*
	fs.unlink('debug.log');
	var log_file = fs.createWriteStream('debug.log', {flags : 'w'});
	var log_stdout = process.stdout;
			
	console.log = function(d) { //
		log_file.write(util.format(d));
		//log_stdout.write(util.format(d));
		return;
	};*/
}
else if(process.argv.length == 3 && process.argv[2]=="-p"){
	app.set('ENV', "deployment");
}
else if(process.argv[6]=="--test"){
	app.set('ENV', "testing");
}
else{
	console.log("server.js: incorrect call use");
	process.exit(1);
}

/////////////// APPLICATION CONFIGURATION ///////////////
var options = {
  key: fs.readFileSync('./server/opt/certs/feuphub_fe_up_pt.key'),
  cert: fs.readFileSync('./server/opt/certs/cert-437-feuphub.fe.up.pt.pem'),
  chain: fs.readFileSync('./server/opt/certs/chain-437-feuphub.fe.up.pt.pem'),
  missinglink: fs.readFileSync('./server/opt/certs/TERENASSLCA.crt')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'application')));

// Port definitions based on execution mode
if (app.get('ENV')=="deployment") {
	app.set('port', process.env.PORT || 443);
}
else if (app.get('ENV')=="development"){
	app.set('port', process.env.PORT || 8100);
}
else if (app.get('ENV')=="testing"){
	app.set('port', process.env.PORT || 5000);
}

/////////////// APPLICATION ROUTES ///////////////
app.get('/', function(req, res){
	res.sendfile(__dirname + 'index.html');
});

app.use('/api/database', database.api);
app.use('/api/sigarra', sigarra);
app.use('/api/auth', auth.api);

app.use('*',function(req, res){
	res.send('404 not found');
});

/////////////// APPLICATION START ///////////////
https.createServer(options, app).listen(app.get('port'), function(){
});

module.exports = app;