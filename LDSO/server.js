// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');			//for proxy http requests
var request = request.defaults({jar: true}) //Store cookies

// Set the headers
var headers = {
    'User-Agent':       'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',
    'Content-Type':     'text/plain;charset=UTF-16'
}

// Configure the checklogin request
var loginCredentials = {
    url: 'http://sigarra.up.pt/feup/pt/vld_validacao.validacao',
    method: 'POST',
    headers: headers,
    form: {'p_app': '162', 'p_amo': '1665', 'p_user': '', 'p_pass': ''}
}

var getStudentPage = {
    url: 'https://sigarra.up.pt/feup/pt/vld_entidades_geral.entidade_pagina?',
    method: 'GET',
    headers: headers,
    form: {'pct_id': ''}
} 

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

var port = process.env.PORT || 901; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:901/api)
router.get('/',function(req,res){
request({
		url: 'https://sigarra.up.pt/feup/pt/WEB_PAGE.INICIAL',
		method: 'GET',
		headers: headers,
		},function (error, response, body) {
			if (!error && response.statusCode == 200) {
				res.json({body: response});
			}
			else{
			res.json({ response: 400, body: response});
			}
	})
})

router.get('/userpage', function(req, res) {	
	getStudentPage.form.pct_id = req.body.userid;
	// Start the request	
	request(getStudentPage, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.json({body: response});
		}
		else{
			res.json({ response: 400, body: response});
		}
	})
});

router.post('/login', function(req, res) {
	
	loginCredentials.form.p_user = req.body.username;
	loginCredentials.form.p_pass = req.body.password;
	
	// Start the request	
	request(loginCredentials, function (error, response) {
		if (!error && response.statusCode == 200 && response.headers["set-cookie"][1]!== undefined) {
				
				res.json({response: 200, body: response});
				
		}else{
			res.json({ response: 400});
		}
	})
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

// Auxiliar Functions
function homePageCookies()
{

}

function getStudentId()
{
	request({
		url: 'https://sigarra.up.pt/feup/pt/WEB_PAGE.INICIAL',
		method: 'GET',
		headers: headers,
		},function (error, response, body) {
			if (!error && response.statusCode == 200) {
				return body;
				//res.json({body: body});
			}
			else{
			return 400;
			//res.json({ response: 400, body: response});
			}
	})
}