Meteor.startup(function () {
  if (Boards.find().count() === 0) {
    // Create an initial board for development purposes
    Boards.insert(ForestWars.generateRectangularBoard(20, 20));
  }
});
