if (Meteor.isClient) {
  var cellSize = 20;
  var width = Math.floor(500 / cellSize) * cellSize;
  var height = Math.floor(500 / cellSize) * cellSize;
  var Fun = {
    columns: width / cellSize,
    rows: height / cellSize,
    p: .65,
    rng: "pseudo",
    burnDelay: 125,
    burnTime: 3500,
    green: d3.hsl(120, 1, .3),
    burnCount: 0
  };

  Fun.calculatePosition = function (datum, index) {
    return "translate(" + (index % Fun.columns) * cellSize + "," + Math.floor(index / Fun.columns) * cellSize + ")";
  };

  Fun.buildGrid = function () {
    var grid = [];
    for (var i = 0; i < Fun.columns * Fun.rows; i++) {
      grid.push({
        index: i,
        tree: Math.random() < Fun.p,
        burnt: false
      });
    }
    return grid;
  };

  Fun.isATree = function (grid, index) {
    var cell = grid[index];
    return cell.tree;
  };

  Fun.addNeighbors = function (grid) {
    var highestIndex = (Fun.columns * Fun.rows) - 1;
    for (var i = 0; i < grid.length; i++) {
      neighbors = []

      north = i - Fun.columns
      if (north > 0 && Fun.isATree(grid, north)) {
        neighbors.push(north)
      }

      south = i + Fun.columns
      if (south < highestIndex && Fun.isATree(grid, south)) {
        neighbors.push(south)
      }

      west = i - 1
      if (west > 0 && west % Fun.columns < Fun.columns - 1 && Fun.isATree(grid, west)) {
        neighbors.push(west)
      }

      east = i + 1
      if (east < highestIndex && east % Fun.columns > 0 && Fun.isATree(grid, east)) {
        neighbors.push(east)
      }

      grid[i].neighbors = neighbors;
    }
  };

  Fun.createBoard = function () {
    return d3.select("#board");
  };

  Fun.burnCell = function (board, burnIndex) {
    var cell = board.select("#cell_" + burnIndex);
    Fun.burnCount++;

    cell.transition()
        .duration(Fun.burnTime)
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

    Fun.burnNeighbors(board, cell);
  };

  Fun.burnNeighbors = function (board, cell) {
    var datum = cell.data()[0];
    console.log(cell.data())
    if (datum.burnt) {
      return;
    } else {
      datum.burnt = true;
    }

    if (datum['neighbors'] && datum.neighbors.length > 0) {
      setTimeout(function () {
        for (var i = 0; i < datum.neighbors.length; i++) {
          var neighbor = datum.neighbors[i];
          Fun.burnCell(board, neighbor);
        }
      }, Fun.burnDelay);
    }
  };

  Fun.start = function () {
    // Create the board
    var board = Fun.createBoard();
    console.log(board);

    // Bind the data
    var data = Fun.buildGrid();
    board.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("transform", Fun.calculatePosition)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("id", function (d, i) {
          return "cell_" + i;
        })
        .style("fill", function (d) {
          if (d.tree) {
            return d3.hsl(120, 1, .3);
          }
        });

    // Add Neighbors
    Fun.addNeighbors(data);
console.log(data)
    // Pick a tree to turn
    var burnIndex = Math.floor(Math.random() * data.length);
    Fun.burnCell(board, burnIndex);
  };

  //
  // Start the FUN
  //
  // setTimeout(function() {
  //   Fun.start();
  // }, 5000);
Template.board.rendered = function() {
    Fun.start()
  }

}