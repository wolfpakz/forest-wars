ForestWars = {}

ForestWars.config = {
  treeProbability: 0.50
};

ForestWars.generateBoardCells = function (columns, rows, treeProbability) {
  var grid = [];
  treeProbability = treeProbability || ForestWars.config.treeProbability

  for (var i = 0; i < columns * rows; i++) {
    grid.push({
      index: i,
      tree: Math.random() < treeProbability,
      burnt: false
    });
  }

  return grid;
};