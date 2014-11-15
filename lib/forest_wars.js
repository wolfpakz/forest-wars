ForestWars = {};

ForestWars.config = {
  cellSize: 20,
  treeProbability: 0.50
};

ForestWars.generateBoardCells = function (rows, columns) {
  var grid = [];

  for (var i = 0; i < rows * columns; i++) {
    grid.push({
      index: i,
      tree: Math.random() < ForestWars.config.treeProbability,
      burnt: false
    });
  }

  return grid;
};

ForestWars.generateRectangularBoard = function(rows, columns) {
  return {
    shape: 'square',
    rows: rows,
    columns: columns,
    cells: ForestWars.generateBoardCells(rows, columns)
  };
};

ForestWars.initializeBoard = function() {
  console.log('-- Initializing Board --');

  var board = Session.get('board');

  d3.selectAll("#board > rect")
    .data(board.cells)
    .attr("transform", ForestWars.cellPositionCalculator)
    .attr("width", ForestWars.config.cellSize)
    .attr("height", ForestWars.config.cellSize)
    .attr("id", function (d, i) {
      return "cell_" + i;
    })
    .style("fill", function(datum, index) {
      if (datum.tree) { return d3.hsl(120, 1, .3); }
    });
};

ForestWars.cellPositionCalculator = function(datum, index) {
  var board = Session.get('board');

  return "translate(" + (index % board.columns) * ForestWars.config.cellSize + "," + Math.floor(index / board.columns) * ForestWars.config.cellSize + ")";
};
