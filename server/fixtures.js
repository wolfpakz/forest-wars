Meteor.startup(function () {
  if (Games.find().count() === 0) {
    // Create an initial board for development purposes
    Games.insert(ForestWars.createGame());
  }
});
