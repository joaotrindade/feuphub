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

        alert( 'User:' + username + '\nPassword:' + password )
    },
});