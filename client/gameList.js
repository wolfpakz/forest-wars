
Template.gameList.helpers({
  games: function() {
    return Games.find();
  }
});