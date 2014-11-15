ForestWars = {};

ForestWars.config = {
  burnDelay: 125,
  burnTime: 3500,
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
    shape: 'rectangle',
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

ForestWars.burnByIndex = function(index) {
  var board = Session.get('board');
  var datum = board.cells[index];
  var cell  = d3.select('#cell_' + datum.index)[0][0];

  ForestWars.burnCell(cell, datum);
}

ForestWars.burnCell = function (cell, datum) {
  var board  = Session.get('board');

  if (datum.burnt) {
    return;
  } else {
    datum.burnt = true;
    board.cells[datum.index] = datum;
    Session.set('board', board);
  }

  var d3Cell = d3.select("#" + cell.id);

  d3Cell.transition()
      .duration(ForestWars.config.burnTime)
      .styleTween("fill", function () {
        return function (t) {
          var ts = [.05, .9, 1];
          if (t < ts[0]) {
            var tf = t / ts[0];
            return d3.hsl(60 * (1 - tf), 1, .9 - .4 * tf);
          } else if (t < ts[1]) {
            var tf = (t - ts[0]) / (ts[1] - ts[0])
            return d3.hsl(0, 1 - tf, .5)
          } else {
            var tf = (t - ts[1]) / (ts[2] - ts[1]);
            return d3.hsl(0, 0, .3 * (1 - tf) + .2)
          }
        };
      });

  setTimeout(function () {
    ForestWars.burnNeighbors(cell, datum);
  }, ForestWars.config.burnDelay);
};

ForestWars.burnNeighbors = function(cell, datum) {
  var board = Session.get('board');

  // {shape: 'rectangle'} -> getRectangleFactory
  // {shape: 'circle'}    -> getCircleFactory
  var neighborFactory = 'get' + board.shape.charAt(0).toUpperCase() + board.shape.slice(1) + 'Neighbors';

  if (ForestWars[neighborFactory]) {
    var neighbors = ForestWars[neighborFactory](cell, datum);
    for (var i = 0; i < neighbors.length; i++) {
      ForestWars.burnByIndex(neighbors[i]);
    }
  }
}

ForestWars.getRectangleNeighbors = function (cell, datum) {
  var board = Session.get('board');
  var highestIndex = (board.columns * board.rows) - 1;
  var index = datum.index;
  var neighbors = []

  var north = index - board.columns
  if (north > 0 && board.cells[north].tree) {
    neighbors.push(north)
  }

  var south = index + board.columns
  if (south < highestIndex && board.cells[south].tree) {
    neighbors.push(south)
  }

  var west = index - 1
  if (west > 0 && west % board.columns < board.columns - 1 && board.cells[west].tree) {
    neighbors.push(west)
  }

  var east = index + 1
  if (east < highestIndex && east % board.columns > 0 && board.cells[east].tree) {
    neighbors.push(east)
  }

  return neighbors;
};