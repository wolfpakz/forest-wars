Template.board.rendered = function () {
  ForestWars.initializeBoard();
};

Template.board.helpers({
  board: function() {
    return Session.get('board');
  }
});