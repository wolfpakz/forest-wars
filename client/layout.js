
Template.layout.events({
  'click #create-game': function(click) {
    var game = {};
    game._id = Games.insert(ForestWars.createGame());
    Router.go('game', game);
  }
});