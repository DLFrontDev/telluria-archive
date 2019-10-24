var gridObject = {
  gridSize: {
    width: 30,
    height: 20
  },
  gridDrag: {
    dragging: false,
    dragData: {
      containerSize: {
        width: document.getElementById("grid-container").offsetWidth,
        height: document.getElementById("grid-container").offsetHeight
      },
      gridSize: {
        width: function () {
          return gridObject.gridSize.width * parseInt(getComputedStyle(document.getElementById("grid").querySelector(".grid-cell"))["width"],10);
        },
        height: function () {
          return gridObject.gridSize.height * parseInt(getComputedStyle(document.getElementById("grid").querySelector(".grid-cell"))["height"],10);
        }
      },
      containerOffset: {
        top: document.getElementById("grid-container").getBoundingClientRect().top + document.body.scrollTop,
        left: document.getElementById("grid-container").getBoundingClientRect().left + document.body.scrollLeft
      },
      lastMousePos: {
        x: null,
        y: null
      }
    },
    events: {
      gridDragStart: function (event) {
        if (actions.type=="move" && event.button==0) {
          gridObject.gridDrag.dragging=true;
          /* Save mouse position */
          gridObject.gridDrag.dragData.lastMousePos = { x: event.pageX - gridObject.gridDrag.dragData.containerOffset.left, y: event.pageY - gridObject.gridDrag.dragData.containerOffset.top };
        }
      },
      gridDragStop: function (event) {
        gridObject.gridDrag.dragging=false;
      },
      gridDragMove: function (event) {
        if(gridObject.gridDrag.dragging == true) {
          var currentMousePos = { x: event.pageX - gridObject.gridDrag.dragData.containerOffset.left, y: event.pageY - gridObject.gridDrag.dragData.containerOffset.top };
          var changeX = currentMousePos.x - gridObject.gridDrag.dragData.lastMousePos.x;
          var changeY = currentMousePos.y - gridObject.gridDrag.dragData.lastMousePos.y;

          /* Save mouse position */
          gridObject.gridDrag.dragData.lastMousePos = currentMousePos;

          var gridTop = parseInt(getComputedStyle(document.getElementById("grid"))["top"],10);
          var gridLeft = parseInt(getComputedStyle(document.getElementById("grid"))["left"],10);

          var gridTopNew = gridTop + changeY;
          var gridLeftNew = gridLeft + changeX;

          /* Validate top and left do not fall outside the image, otherwise white space will be seen */
          if (gridObject.gridDrag.dragData.gridSize.height() > gridObject.gridDrag.dragData.containerSize.height) {
            if(gridTopNew > 0) {
              gridTopNew = 0;
            }
            if(gridTopNew < (gridObject.gridDrag.dragData.containerSize.height - gridObject.gridDrag.dragData.gridSize.height())) {
              gridTopNew = gridObject.gridDrag.dragData.containerSize.height - gridObject.gridDrag.dragData.gridSize.height();
            }
            document.getElementById("grid").style.top = gridTopNew + 'px';
          }

          if (gridObject.gridDrag.dragData.gridSize.width() > gridObject.gridDrag.dragData.containerSize.width) {
            if(gridLeftNew > 0) {
              gridLeftNew = 0;
            }
            if(gridLeftNew < (gridObject.gridDrag.dragData.containerSize.width - gridObject.gridDrag.dragData.gridSize.width())) {
              gridLeftNew = gridObject.gridDrag.dragData.containerSize.width - gridObject.gridDrag.dragData.gridSize.width();
            }
            document.getElementById("grid").style.left = gridLeftNew + 'px';
          }
        }
      }
    }
  },
  gridZoom: {
    events: {
      zoomIn: function () {
        var zoom = parseInt(document.getElementById("grid").getAttribute("data-zoom"));

        if (zoom<2) {
          document.getElementById("grid").setAttribute("data-zoom", zoom+1);

          grid.style.width = gridObject.gridSize.width * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["width"],10) + "px";
          grid.style.height = gridObject.gridSize.height * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["height"],10) + "px";

          grid.style.left = -(gridObject.gridDrag.dragData.gridSize.width() - gridObject.gridDrag.dragData.containerSize.width) / 2 + "px";
          grid.style.top = -(gridObject.gridDrag.dragData.gridSize.height() - gridObject.gridDrag.dragData.containerSize.height) / 2 + "px";
        }
      },
      zoomOut: function () {
        var zoom = parseInt(document.getElementById("grid").getAttribute("data-zoom"));

        if (zoom>0) {
          document.getElementById("grid").setAttribute("data-zoom", zoom-1);

          grid.style.width = gridObject.gridSize.width * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["width"],10) + "px";
          grid.style.height = gridObject.gridSize.height * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["height"],10) + "px";

          grid.style.left = -(gridObject.gridDrag.dragData.gridSize.width() - gridObject.gridDrag.dragData.containerSize.width) / 2 + "px";
          grid.style.top = -(gridObject.gridDrag.dragData.gridSize.height() - gridObject.gridDrag.dragData.containerSize.height) / 2 + "px";
        }
      }
    }
  },
  gridHolder: [],
  imageHolder: [],
  poiHolder: []
}

document.querySelector(".zoom-in").addEventListener("click", gridObject.gridZoom.events.zoomIn);
document.querySelector(".zoom-out").addEventListener("click", gridObject.gridZoom.events.zoomOut);

Cell = function (posX, posY) {
  this.pos = {
    x: posX,
    y: posY
  }

  this.paint = {
    fill: false,
    color: "lightgrey"
  }

  this.supercell = {
    element: null,
    data: null
  }

  this.subcell = {
    elements: [],
    datas: []
  }

  this.border = {
    left: false,
    top: false,
    right: false,
    bottom: false
  }

  this.type = function () {
    switch (true) {
      case (this.supercell.data!=null):
      return "subcell";
      break;
      default:
      return "cell";
    }
  }

  this.element = document.createElement("div");
  this.element.classList.add("grid-cell");
  this.element.setAttribute('posX', posX);
  this.element.setAttribute('posY', posY);

  this.poi = null;
  this.image = null;

  this.methods = {
    cellGetElement: function (target){
      var origin, supercell;
      if (target.classList.contains("grid-subcell")) {
        supercell = target.parentNode.parentNode;
        supercell = getCell(supercell.getAttribute("posX"), supercell.getAttribute('posY'));
        origin = getCell(target.getAttribute("posX"), target.getAttribute('posY'), supercell);
      } else {
        origin = getCell(target.getAttribute("posX"), target.getAttribute('posY'));
      }

      if (origin) {
        return origin;
      }
    }
  }

  this.events = {
    cellClick: function (event){
      if (document.body.contains(event.target) && event.button==0) {
        var target;
        switch (true) {
          case (event.target.classList.contains("grid-cell")):
          target=event.target;
          break;

          case (event.target.classList.contains("grid-poi")):
          case (event.target.classList.contains("grid-image")):
          target=event.target.parentNode;
          break;

          default:
          target=false;
        }

        if (target) {
          if (actions.type=="brush" || actions.type=="erase") {
            actions.editDrag.dragging=true;
          }
          if (getCell(target.getAttribute("posX"), target.getAttribute('posY')).methods.cellGetElement(target)) {
            editCell(getCell(target.getAttribute("posX"), target.getAttribute('posY')).methods.cellGetElement(target));
          }
        }
      }
    },
    cellMouseover: function (event){
      var target;
      switch (true) {
        case (event.target.classList.contains("grid-cell")):
        target=event.target;
        break;

        case (event.target.classList.contains("grid-poi")):
        case (event.target.classList.contains("grid-image")):
        target=event.target.parentNode;
        break;

        default:
        target=false;
      }

      if (target) {
        if (getCell(target.getAttribute("posX"), target.getAttribute('posY')).methods.cellGetElement(target)) {
          if (actions.type=="brush" || actions.type=="erase") {
            actions.editDrag.events.editDragHover(getCell(target.getAttribute("posX"), target.getAttribute('posY')).methods.cellGetElement(target));
          }
          previewAction(getCell(target.getAttribute("posX"), target.getAttribute('posY')).methods.cellGetElement(target));
        }
      }
    },
    cellMouseout: function (event){
      var cells = document.getElementById("grid").querySelectorAll(".preview");
      for (cell of cells) {
        cell.classList.remove("preview");
      }
    }
  }
  this.element.addEventListener("mousedown", this.events.cellClick );
  this.element.addEventListener("mouseover", this.events.cellMouseover);
  this.element.addEventListener("mouseout", this.events.cellMouseout);

  this.addColor = function (color) {
    if (color!="transparent") {
      this.paint.fill = true;
    }
    this.paint.color = color;
    this.updateCell("color");
  }

  this.addBorder = function (direction) {
    var oppositeDir;

    switch (direction) {
      case "left":
      oppositeDir="right";
      break;
      case "top":
      oppositeDir="bottom";
      break;
      case "right":
      oppositeDir="left";
      break;
      case "bottom":
      oppositeDir="top";
      break;
      default:

    }

    if (this.border[direction]!=true) {
      this.border[direction] = true;
      if (getAdjCell(this, direction)) {
        var adjCell = getAdjCell(this, direction);
        if (Array.isArray(adjCell)) {
          for (var row of adjCell) {
            for (var cell of row) {
              cell.border[oppositeDir] = true;
              if (cell.element.querySelector(".pseudo-border-"+oppositeDir)) {
                cell.element.removeChild(cell.element.querySelector(".pseudo-border-"+oppositeDir));
                if (!cell.element.querySelector("[class*='pseudo-border'], .grid-image")) {
                  cell.element.style.position = "initial";
                }
              }
            }
          }
        } else {
          if ((this.type()=="subcell" && adjCell.type()=="cell") && (direction=="right" || direction=="bottom")) {
            if (!this.element.matches(".grid-cell:last-child .grid-subcell:last-child") && direction=="right" || !this.element.matches(".grid-cell .grid-row:not(:last-child) .grid-subcell") && direction=="bottom") {
              var pseudoBorder = document.createElement("div");
              pseudoBorder.classList.add("pseudo-border-"+direction);
              this.element.appendChild(pseudoBorder);
              this.element.style.position="relative";
            }
          } else {
            adjCell.border[oppositeDir]=true;
          }
        }
      }

      this.updateCell("border");
      if (adjCell) {
        if (Array.isArray(adjCell)) {
          for (var row of adjCell) {
            for (var cell of row) {
              cell.updateCell("border");
            }
          }
        } else {
          adjCell.updateCell("border");
        }
      }

    }
  }

  this.removeBorder = function (direction) {
    var oppositeDir, sharedBorderDir;

    switch (direction) {
      case "left":
      oppositeDir="right";
      break;
      case "top":
      oppositeDir="bottom";
      break;
      case "right":
      oppositeDir="left";
      this.pos.y==0 ? sharedBorderDir="bottom" : sharedBorderDir="top";
      break;
      case "bottom":
      oppositeDir="top";
      this.pos.x==0 ? sharedBorderDir="right" : sharedBorderDir="left";
      break;
      default:

    }

    this.border[direction] = false;
    if (this.element.querySelector(".pseudo-border-"+direction)) {
      this.element.removeChild(this.element.querySelector(".pseudo-border-"+direction));
      if (!this.element.querySelector("[class*='pseudo-border'], .grid-image")) {
        this.element.style.position = "initial";
      }
    }
    if (getAdjCell(this, direction)) {
      var adjCell = getAdjCell(this, direction);
      if (Array.isArray(adjCell)) {
        for (var row of adjCell) {
          for (var cell of row) {
            cell.border[oppositeDir] = false;

            if (cell.element.querySelector(".pseudo-border-"+oppositeDir)) {
              cell.element.removeChild(cell.element.querySelector(".pseudo-border-"+oppositeDir));
              if (!cell.element.querySelector("[class*='pseudo-border'], .grid-image")) {
                cell.element.style.position = "initial";
              }
            }
          }
        }
      } else {
        if (this.type()=="subcell" && adjCell.type()=="cell") {
          if ((!this.element.matches(".grid-cell:last-child .grid-subcell:last-child") && direction=="right") || (!this.element.matches(".grid-cell .grid-row:not(:last-child) .grid-subcell") && direction=="bottom")) {
            var sharedCell = getAdjCell(this, sharedBorderDir);
            if (!sharedCell.element.querySelector(".pseudo-border-"+direction) && adjCell.border[oppositeDir]==true) {
              var pseudoBorder = document.createElement("div");
              pseudoBorder.classList.add("pseudo-border-"+direction);
              sharedCell.element.appendChild(pseudoBorder);
              sharedCell.element.style.position="relative";
            }
          }
          adjCell.border[oppositeDir]=false;
        } else {
          adjCell.border[oppositeDir]=false;
        }
      }
    }

    this.updateCell("border");
    if (adjCell) {
      if (Array.isArray(adjCell)) {
        for (var row of adjCell) {
          for (var cell of row) {
            cell.updateCell("border");
          }
        }
      } else {
        adjCell.updateCell("border");
      }
    }
  }

  this.addPosition = function (x, y) {
    this.pos.x=x;
    this.pos.y=y;

    this.element.setAttribute("posx", x);
    this.element.setAttribute("posy", y);

    this.updateCell("position");
  }

  this.updateCell = function (update) {
    switch (update) {
      case "color":
      this.element.style.backgroundColor = this.paint.color;
      break;

      case "border":
      for (key in this.border) {
        if (this.border[key]) {
          this.element.classList.add("border-" + key);
        } else {
          this.element.classList.remove("border-" + key);
        }
      };
      break;

      case "position":
      if (this.poi) {
        this.poi.pos.x=this.pos.x;
        this.poi.pos.y=this.pos.y;
      }

      if (this.image) {
        this.image.pos.x=this.pos.x;
        this.image.pos.y=this.pos.y;
      }
      break;
    }
  }
}

Poi = function (anchor, text, color) {
  this.anchor = anchor;
  this.anchor.poi=this;
  this.text = text;
  this.color = color;

  this.element = document.createElement("button");
  this.element.classList.add("grid-poi");
  this.element.setAttribute("data-toggle", "tooltip");
  this.element.setAttribute("data-trigger", "hover");
  this.element.innerHTML="!";

  this.element.setAttribute("data-original-title", this.text);
  this.element.style.backgroundColor = this.color;

  if (this.anchor.image) {
    this.image = this.anchor.image;
    this.image.element.setAttribute("data-toggle", "tooltip");
    this.image.element.setAttribute("data-trigger", "hover");
    this.image.element.setAttribute("data-original-title", this.text);
  } else {
    this.image = null;
  }

  this.pos = {
    x: anchor.pos.x,
    y: anchor.pos.y
  }

  this.addText = function (text) {
    this.text = text;
    this.element.setAttribute("data-original-title", text);
    if (this.image) {
      this.image.element.setAttribute("data-original-title", text);
    }
  }

  this.addColor = function (color) {
    this.color = color;
    this.element.style.backgroundColor = color;
  }
}

Image = function (anchor, source, size) {
  this.anchor = anchor;

  for (var row of anchor) {
    for (var cell of row) {
      cell.image=this;
    }
  }

  this.source = source;
  this.size = {
    x: size.x,
    y: size.y
  }

  this.pos = {
    x: anchor[0][0].pos.x,
    y: anchor[0][0].pos.y
  }

  this.element = document.createElement("img");
  this.element.classList.add("grid-image");
  this.element.style.height=this.size.y*parseInt(window.getComputedStyle(anchor[0][0].element).height)+"px";
  this.element.style.width=this.size.x*parseInt(window.getComputedStyle(anchor[0][0].element).width)+"px";
  this.element.setAttribute("src", this.source);
  this.anchor[0][0].element.style.position="relative";

  this.poi = null;
}

initGrid = function () {
  var grid  = document.getElementById("grid");
  for (i = 0; i < gridObject.gridSize.height; i++) {
    var rowEle = document.createElement("div");
    var row = [];
    rowEle.classList.add("grid-row");
    for (ii = 0; ii < gridObject.gridSize.width; ii++) {
      var cell = new Cell(ii, i);
      rowEle.appendChild(cell.element);
      row.push(cell);
    }
    grid.appendChild(rowEle);
    gridObject.gridHolder.push(row);
  }

  grid.style.width = gridObject.gridSize.width * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["width"],10) + "px";
  grid.style.height = gridObject.gridSize.height * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["height"],10) + "px";

  grid.style.left = -(gridObject.gridDrag.dragData.gridSize.width() - gridObject.gridDrag.dragData.containerSize.width) / 2 + "px";
  grid.style.top = -(gridObject.gridDrag.dragData.gridSize.height() - gridObject.gridDrag.dragData.containerSize.height) / 2 + "px";

  document.getElementById("grid").addEventListener("mousedown", gridObject.gridDrag.events.gridDragStart);
  document.getElementById("grid").addEventListener("mousemove", gridObject.gridDrag.events.gridDragMove);
  window.addEventListener("mouseup", gridObject.gridDrag.events.gridDragStop);
}

initGrid();
