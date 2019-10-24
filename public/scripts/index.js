var gridObject = $("#grid")[0].getBoundingClientRect();
var gridN = 30;
var objHolder = {
  cellHolder : [],
  areaHolder : []
}

getCellByEle = function (element) {
  var index = ($(element).attr('posX') - 1) + ($(element).attr('posY') - 1) * 30;
  var target = objHolder.cellHolder[index];

  return target;
}

getCellByCoords = function (posX, posY) {
  var index = (posX - 1) + (posY - 1) * 30;
  var target = objHolder.cellHolder[index];

  return target;
}

addArea = function (start, sizeX, sizeY) {
  var targetList = [];
  var start = getCellByEle(start);

  for (i = start.posY; i < start.posY + sizeY; i++) {
    for (ii = start.posX; ii < start.posX + sizeX; ii++) {
      target = getCellByCoords(ii, i);
      targetList.push(target);
    }
  }

  var area = new Area("New", "blue", targetList, sizeX, sizeY);
  objHolder.areaHolder.push(area);
}

Cell = function (posX, posY) {
  this.posX = posX;
  this.posY = posY;

  this.element = document.createElement("div");
  $(this.element).addClass("grid-cell");
  $(this.element).attr('posX', posX);
  $(this.element).attr('posY', posY);

  this.colorize = function (color) {
    $(this.element).css({
      "background-color": color
    });
  }

  $(this.element).click(function () {
    addArea(this, 3, 3);
  });
}

Area = function (name, color, CellList, sizeX, sizeY) {
  this.name = name;
  this.color = color;
  this.CellList = CellList;
  this.area = document.createElement("div");
  this.sizeX = sizeX;
  this.sizeY = sizeY;

  var tooltip = "<p>Origin X: " + CellList[0].posX + "<br>Origin Y: " + CellList[0].posY + "<br><br>Color: " + this.color + "</p>";

  $(this.area).addClass("area");
  $(this.area).attr('title', tooltip);
  $(this.area).attr('data-toggle', 'tooltip');
  $(this.area).attr('data-html', 'true');
  $(this.area).css({
    "background-color" : color
  })

  this.resize = function () {
    $(this.area).css({
      "height": sizeY * (gridObject.width / gridN) - 1,
      "width": sizeX * (gridObject.width / gridN) - 1,
      "left": (CellList[0].posX - 1) * (gridObject.width / gridN) + 1,
      "top": (CellList[0].posY - 1) * (gridObject.width / gridN) + 1
    })
  }

  this.resize();

  $("#grid").append(this.area);
  $(this.area).tooltip({ title: tooltip });
}

initGrid = function () {
  for (i = 0; i < gridN; i++) {
    var row = document.createElement("div");
    $(row).addClass("grid-row");
    for (ii = 0; ii < gridN; ii++) {
      var cell = new Cell(ii + 1, i + 1);
      $(row).append(cell.element);
      objHolder.cellHolder.push(cell);
    }
    $("#grid").append(row);
  }

  $(".grid-cell").css({
    "width": gridObject.width / gridN + "px",
    "height": gridObject.width / gridN + "px"
  });


}

initGrid();

$(document).ready(function () {
  $(window).resize(function () {
    gridObject = $("#grid")[0].getBoundingClientRect();

    $(".grid-cell").css({
      "width": gridObject.width / gridN + "px",
      "height": gridObject.width / gridN + "px"
    });

    for (var i in objHolder.areaHolder) {
      objHolder.areaHolder[i].resize();
    }
  });
});
