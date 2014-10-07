App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});


App.loginController = Ember.Object.create({
    login: function(username, password) {
      // $.ajax stuff goes here
    }
});

App.LoginFormView = Ember.View.extend({
    tagName: 'form',
    username: null,
    password: null,

    submit: function(event) {
        event.preventDefault();

        var username = this.get('username');
        var password = this.get('password');

		$.ajax({
			type: "POST",
			url: "api/login",
			data: {'username':username,'password':password},
			async: false,
			success: function(data, textStatus, jqXHR)
			{
				if(data.headers["set-cookie"].length>1)
				{
					//set sigarra cookies
					document.cookie=data.headers["set-cookie"][0];
					document.cookie=data.headers["set-cookie"][1];
					$.ajax({
						type: "GET",
						url: "api/initialWebPage",
						async: false,
						success: function(data, textStatus, jqXHR)
						{
							document.cookie=data.headers["set-cookie"][0];
							var num = parserLogin(data.body);
							console.log("pct_id do parser: ");
							console.log(num);
							$.ajax({
								type: "GET",
								url: "/api/getPvNumUnico",
								//sigarra.up.pt/feup/pt/vld_entidades_geral.entidade_pagina?pct_id=777369 //
								data: "pct_id="+num,
								async: false,
								success: function(data, textStatus, jqXHR)
								{
									console.log(data);
								},
								error: function(XMLHttpRequest, textStatus, errorThrown) {
									alert("some error");
								}
							});
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) {
							alert("some error");
						}
					});	
				}
				else{
					alert("incorrect sifeup login credentials");
				}
			},complete: function(){
				$.ajax({
					type: "POST",
					url: "api/logout",
					async: false,
					success: function(data, textStatus, jqXHR)
					{}
				});
				clearCookies();
			}
		});
    },
});

function clearCookies(){
	if(document.cookie.indexOf("HTTP_SESSION") >= 0){
		document.cookie = "HTTP_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	if(document.cookie.indexOf("SI_SESSION") >= 0){
		document.cookie = "SI_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	if(document.cookie.indexOf("SI_SECURITY") >= 0){
		document.cookie = "SI_SECURITY" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	return;
}

function parserLogin(input_html){
	var e1 = document.createElement( 'div' );
	e1.innerHTML = input_html;
	var url = e1.querySelector('.autenticacao-nome').href;
	e1.innerHTML = "";
	ei = null;
	var temp = url.split("=")
	var value = temp[1];
	return value;
}
