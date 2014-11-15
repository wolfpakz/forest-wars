Template.board.rendered = function () {
  ForestWars.initializeBoard();
};

Template.board.helpers({
  board: function() {
    return Session.get('board');
  }
});

Template.board.events({
  'click #board rect': function(click) {
    var cell  = click.target;
    var datum = this;
    ForestWars.burnCell(cell, datum);
  }
});