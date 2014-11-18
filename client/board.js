Template.board.rendered = function () {
  ForestWars.initializeBoard();
  ForestWars.startAnimation();
};

Template.board.helpers({
  game: function() {
    return Session.get('game');
  }
});

Template.board.events({
  'click #board rect': function(click) {
    var cell  = click.target;
    var datum = this;

    if (datum.tree) {
      ForestWars.sparkTree(datum.index);
    }
  }
});