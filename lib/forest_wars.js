ForestWars = {};

ForestWars.config = {
  burnDelay: 250,
  burnTime: 3500,
  cellSize: 20,
  treeProbability: 1,
  timeoutCount: 0
};

ForestWars.sparkedTrees = {};
ForestWars.burningTrees = {};
ForestWars.burntTrees = {};
ForestWars.createGame = function() {
  return {
    board: ForestWars.generateRectangularBoard(20, 20)
  }
};

ForestWars.generateBoardCells = function (rows, columns) {
  var grid = [];

  for (var i = 0; i < rows * columns; i++) {
    grid.push({
      index: i,
      tree: Math.random() < ForestWars.config.treeProbability,
      burned_at: null
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

  var game  = Session.get('game');
  var board = game.board;

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

ForestWars.startAnimation = function() {
  var running = false;

  setInterval(function() {
    if (!running) {
      running = true;

      // Burn sparked trees
      for (var index in ForestWars.sparkedTrees) {
        ForestWars.burnCell(+index);
      }

      // Spark neighbors of trees that've been burning for over 0.5 seconds
      for (var index in ForestWars.burningTrees) {
        var game  = Session.get('game');
        var board = game.board;
        var datum = board.cells[+index];
        var elapsed = Date.now() - datum.burned_at;

        if (elapsed > ForestWars.config.burnDelay) {
          delete ForestWars.burningTrees[index];

          ForestWars.burnNeighbors(+index);

          ForestWars.burntTrees[index] = true;
        }
      }

      running = false;
    }
  }, 250);
}

ForestWars.cellPositionCalculator = function(datum, index) {
  var game  = Session.get('game');
  var board = game.board;

  return "translate(" + (index % board.columns) * ForestWars.config.cellSize + "," + Math.floor(index / board.columns) * ForestWars.config.cellSize + ")";
};

ForestWars.sparkTree = function(index) {
  ForestWars.sparkedTrees[index] = true;
};

ForestWars.cellByIndex = function(index) {
  return d3.select('#cell_' + index);
};

ForestWars.burnCell = function (index) {
  var game  = Session.get('game');
  var board = game.board;
  var datum = board.cells[index];

  if (datum.burned_at) {
    return;
  } else {
    delete ForestWars.sparkedTrees[index];
    ForestWars.burningTrees[index] = true;

    datum.burned_at = Date.now();
    board.cells[index] = datum;

    Session.set('game', game);
  }

  var d3Cell = ForestWars.cellByIndex(index);

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
};

ForestWars.burnNeighbors = function(index) {
  var game  = Session.get('game');
  var board = game.board;

  // {shape: 'rectangle'} -> getRectangleFactory
  // {shape: 'circle'}    -> getCircleFactory
  var neighborFactory = 'get' + board.shape.charAt(0).toUpperCase() + board.shape.slice(1) + 'Neighbors';

  if (ForestWars[neighborFactory]) {
    var neighbors = ForestWars[neighborFactory](index);
    for (var i = 0; i < neighbors.length; i++) {
      ForestWars.burnCell(neighbors[i]);
    }
  }
}

ForestWars.getRectangleNeighbors = function (index) {
  var game  = Session.get('game');
  var board = game.board;

  var highestIndex = (board.columns * board.rows) - 1;
  var neighbors = []

  var north = index - board.columns;
  if (north >= 0 && board.cells[north].tree) {
    neighbors.push(north);
  }

  var south = index + board.columns;
  if (south <= highestIndex && board.cells[south].tree) {
    neighbors.push(south);
  }

  var west = index - 1;
  if (west >= 0 && west % board.columns < board.columns - 1 && board.cells[west].tree) {
    neighbors.push(west);
  }

  var east = index + 1;
  if (east <= highestIndex && east % board.columns > 0 && board.cells[east].tree) {
    neighbors.push(east);
  }

  return neighbors;
};
