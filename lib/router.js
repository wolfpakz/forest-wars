Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return Meteor.subscribe('games');
  }
});

Router.route('/', { name: 'gameList' });

Router.route('/game/:_id', {
  name: 'game',
  template: 'board',
  data: function() {
    var game = Games.findOne(this.params._id);

    Session.set('game', game);

    return game;
  }
})