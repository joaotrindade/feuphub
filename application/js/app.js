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
			success: function(data, textStatus, jqXHR)
			{
				document.cookie=data.headers["set-cookie"][0];
				document.cookie=data.headers["set-cookie"][1];
				console.log(document.cookie);
				if(data.statusCode == 200)
				{
					$.ajax({
						type: "GET",
						url: "api/initialWebPage",
						success: function(data, textStatus, jqXHR)
						{
							document.cookie=data.headers["set-cookie"][0];
							console.log(document.cookie);
							console.log(data);
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) {
							alert("some error");
						}
					});	
				}
			},complete: function(){
				$.ajax({
					type: "POST",
					url: "api/logout",
					success: function(data, textStatus, jqXHR){
						console.log("cleared server of cookies\n");
					},complete: function(){
						document.cookie = "HTTP_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						document.cookie = "SI_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						document.cookie = "SI_SECURITY" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						console.log("cleared client of cookies\n");
					}
				});
			}
		});
    },
});
