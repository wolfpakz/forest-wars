Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return Meteor.subscribe('boards');
  }
});

Router.route('/', {name: 'gameList'});
Router.route('/board/:_id', {
  name: 'board',
  data: function() {
    var board = Boards.findOne(this.params._id);

    Session.set('board', board);

    return board;
  }
})