module.exports = (function() {
    'use strict';
    var api = express.Router();
	
	/////////////// SIGARRA SESSION VARIABLES ///////////////
	var http_session='';
	var si_session='';
	var si_security='';
	var headers = {
		'User-Agent':       'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',
		'Content-Type':     'text/plain;charset=UTF-16',
		'Cookie' : ''
	}
	
	// Configure the checklogin request
	var loginCredentials = {
		url: 'https://sigarra.up.pt/feup/pt/vld_validacao.validacao',
		method: 'POST',
		headers: headers,
		form: {'p_app': '162', 'p_amo': '1665', 'p_user': '', 'p_pass': ''}
	}
	
	var logoutCredentials = {
		url: 'https://sigarra.up.pt/feup/pt/vld_validacao.sair',
		method: 'POST',
		headers: headers,
		form: {'p_address': 'WEB_PAGE.INICIAL'}
	}
	
	var urlStudentCourses = "https://sigarra.up.pt/feup/pt/mob_fest_geral.ucurr_aprovadas_login";

	var studentCourses = {
		url: 'https://sigarra.up.pt/feup/pt/mob_fest_geral.ucurr_aprovadas_login',
		method: 'GET',
		headers: headers,
	}
	
    api.post('/login', function(req, res) {
        loginCredentials.form.p_user = req.body.username;
		loginCredentials.form.p_pass = req.body.password;
	
		// Start the request	
		request(loginCredentials, function (error, response) {
			if (!error && response.statusCode == 200 && response.headers["set-cookie"].length>0) {				
				si_session = response.headers["set-cookie"][0];
				si_security = response.headers["set-cookie"][1];
				headers["Cookie"] = "";
				headers["Cookie"] = http_session+" "+si_session+" "+si_security;
				res.send(response);
			}else{
				res.send(response);
			}
			resetCookies();
		})
    });
	
	api.get('/getStudentCourses',function(req,res){

		studentCourses.url += "?pv_login=" + req.query.pv_login;
		headers["Cookie"] = req.headers.cookie;
		
		// Start the request
		request(studentCourses, function(error, response, body){
		if (!error && response.statusCode == 200) {
				res.send(response);
			}
			else{
				res.send(response);
			}
			studentCourses.url = urlStudentCourses;
			resetCookies();
		})
	});
	
	api.post('/logout',function(req,res){
		headers["Cookie"] = req.headers.cookie;
		// Start the request	
		request(logoutCredentials, function (error, response) {
			res.send(response);
		})
		resetCookies();
	});

	function resetCookies(){
		http_session="";
		si_session="";
		si_security="";
		headers["Cookie"] = "";
		return;
	}

    return api;
}(module || {}));