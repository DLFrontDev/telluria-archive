var actions = {
  type: "move",
  brush: {
    areaBrush: false,
    area: {
      height: 1,
      width: 1
    },
    colorBrush: false,
    color: "#808080",
    borderBrush: false,
    border: {
      left: false,
      top: false,
      right: false,
      bottom: false
    }
  },
  poi: {
    poiCreate: true,
    color: "grey",
    text: ""
  },
  image: {
    imageCreate: true,
    area: {
      height: 1,
      width: 1
    },
    path: null
  },
  subgrid: {
    subgridCreate: true,
    preserve: {
      borders: true,
      color: true
    }
  },
  erase: {
    areaBrush: false,
    area: {
      height: 1,
      width: 1
    },
    colorBrush: false,
    borderBrush: false,
    border: {
      left: false,
      top: false,
      right: false,
      bottom: false
    }
  },
  editDrag: {
    dragging: false,
    dragData: {
      lastMouseCell: {
        cell: null
      }
    },
    events: {
      editDragHover: function (target) {
        if (actions.editDrag.dragData.lastMouseCell!=target && actions.editDrag.dragging==true) {
          editCell(target);
          lastMouseCell=target;
        }
      },
      editDragStop: function () {
        if (actions.editDrag.dragging==true) {
          actions.editDrag.dragging=false;
        }
      }
    }
  }
}

cellBuilder = function () {
  var builder = document.querySelector(".cell-builder .grid-cell");
  builder.classList="grid-cell";
  builder.style.backgroundColor = "lightgrey";

  if (builder.querySelector(".grid-poi")) {
    $(".grid-poi").tooltip('dispose');
  }

  while (builder.firstChild) {
    builder.removeChild(builder.firstChild);
  }

  switch (actions.type) {
    case "brush":
    case "erase":
    if (actions[actions.type].borderBrush) {
      for (var border in actions[actions.type].border) {
        if (actions.type == "brush") {
          builder.classList.toggle("border-"+border , actions[actions.type].border[border]);
        } else {
          builder.classList.toggle("border-"+border , actions[actions.type].border[border]);
          builder.classList.add("border-erase");
        }
      }
    } else {
      for (var border in actions.brush.border) {
        builder.classList.remove("border-"+border);
        builder.classList.remove("border-erase");
      }
    }

    if (actions[actions.type].colorBrush) {
      if (actions.type == "brush") {
        builder.style.backgroundColor = actions.brush.color;
      } else {
        builder.classList.add("background-erase");
      }
    } else {
      if (actions.type == "brush") {
        builder.style.backgroundColor = "lightgrey";
      } else {
        builder.classList.remove("background-erase");
      }
    }
    break;

    case "poi":
    var poi = document.createElement("button");
    poi.classList.add("grid-poi");
    poi.innerHTML="!";

    if (actions.poi.poiCreate) {
      poi.setAttribute("data-toggle", "tooltip");
      poi.setAttribute("data-trigger", "hover");
      poi.setAttribute("data-placement", "bottom");

      poi.setAttribute("data-original-title", actions.poi.text);
      poi.style.backgroundColor = actions.poi.color;

      $(poi).tooltip();
    } else {
      poi.classList.add("background-erase");
    }

    builder.appendChild(poi);
    break;

    case "image":
    var imageIcon = document.createElement("i");
    imageIcon.classList.add("fa", "fa-image", "fa-2x");
    builder.classList.add("has-image");

    if (!actions.image.imageCreate) {
      builder.classList.add("image-erase");
    }

    builder.appendChild(imageIcon);
    break;

    case "subgrid":
    builder.classList.add("grid-supercell");
    for (var i = 0; i < 2; i++) {
      var row = document.createElement("div");
      row.classList.add("grid-row");
      for (var ii = 0; ii < 2; ii++) {
        var cell = document.createElement("div");
        cell.classList.add("grid-cell", "grid-subcell");

        if (ii==1) {
          cell.classList.add("border-left");
        }

        if (i==1) {
          cell.classList.add("border-top");
        }
        row.appendChild(cell);
      }
      builder.appendChild(row);

      if (!actions.subgrid.subgridCreate) {
        for (var subcell of builder.querySelectorAll(".grid-subcell")) {
          subcell.style.backgroundColor = "rgba(255,0,0,0.4)";
        }
      }
    }
    break;
  }
}

toggleSide = function (event) {
  var sidebar;

  if (event.target.classList.contains("btn-toggle-left")) {
    sidebar = document.querySelector(".sidebar-left");
  } else {
    sidebar = document.querySelector(".sidebar-right");
  }

  sidebar.classList.toggle("sidebar-open");
  event.target.classList.toggle("sidebar-open");
  event.target.querySelector("svg").classList.toggle("fa-angle-left");
  event.target.querySelector("svg").classList.toggle("fa-angle-right");
}

addAction = function (event) {
  var tabBtnToken = false;

  var newAction= {
    parent: event.target.getAttribute("parent"),
    action: event.target.getAttribute("action"),
    sub_action: event.target.getAttribute("sub-action"),
    value: event.target.value,
    checked: event.target.checked,
    target: event.target
  }

  if (actions.type=="move") {
    document.getElementById("grid").removeEventListener("mousedown", gridObject.gridDrag.events.gridDragStart);
    document.getElementById("grid").removeEventListener("mousemove", gridObject.gridDrag.events.gridDragMove);
    window.removeEventListener("mouseup", gridObject.gridDrag.events.gridDragStop);
    document.getElementById("grid").style.cursor="pointer";
  }

  if (actions.type=="brush" || actions.type=="erase") {
    window.removeEventListener("mouseup", actions.editDrag.events.editDragStop);
  }

  switch (newAction.parent) {

    //START Move
    case "move":
    {
      if (actions.type!="move") {
        document.getElementById("grid").addEventListener("mousedown", gridObject.gridDrag.events.gridDragStart);
        document.getElementById("grid").addEventListener("mousemove", gridObject.gridDrag.events.gridDragMove);
        window.addEventListener("mouseup", gridObject.gridDrag.events.gridDragStop);
        document.getElementById("grid").style.cursor="-webkit-grab";
      }

      tabBtnToken = true;
    }
    break;
    // END Move

    // START Brush/Erase
    case "brush":
    case "erase":
    {
      window.addEventListener("mouseup", actions.editDrag.events.editDragStop)
      switch (newAction.action) {
        case "areaSize":
        switch (newAction.sub_action) {
          case "toggle":
          actions[newAction.parent].areaBrush=newAction.checked;
          break;

          default:
          actions[newAction.parent].area[newAction.sub_action]=parseInt(newAction.value);
        }
        break;

        case "borders":
        switch (newAction.sub_action) {
          case "toggle":
          actions[newAction.parent].borderBrush=newAction.checked;
          break;

          default:
          actions[newAction.parent].border[newAction.sub_action]=newAction.checked;
        }
        break;

        case "color":
        switch (newAction.sub_action) {
          case "toggle":
          actions[newAction.parent].colorBrush=newAction.checked;
          break;

          default:
          actions[newAction.parent].color=newAction.value;
        }
        break;

        default:
        tabBtnToken = true;
      }
    }
    break;
    // END Brush/Erase

    //START Poi
    case "poi":
    {
      switch (newAction.action) {
        case "options":
        actions.poi.poiCreate=JSON.parse(newAction.sub_action);
        break;

        case "color":
        actions.poi.color=newAction.value;
        break;

        case "text":
        actions.poi.text=newAction.value;
        break;

        default:
        tabBtnToken = true;
      }
    }
    break;
    // END Poi

    //START image
    case "image":
    {
      switch (newAction.action) {
        case "options":
        actions.image.imageCreate=JSON.parse(newAction.sub_action);
        break;

        case "areaSize":
        actions.image.area[newAction.sub_action]=parseInt(newAction.value);
        break;

        case "file":
        console.log(newAction.target.files[0]);
        console.log("Needs Server, placeholder for now.");
        if (actions.image.area.width == actions.image.area.height) {
          actions.image.path="./images/2x2_table.svg";
        }
        break;

        default:
        tabBtnToken = true;
      }
    }
    break;
    // END image

    //START Subgrid
    case "subgrid":
    {
      switch (newAction.action) {
        case "preserve":
        actions.subgrid.preserve[newAction.sub_action]=newAction.checked;
        break;

        case "options":
        actions.subgrid.subgridCreate=JSON.parse(newAction.sub_action);
        break;

        default:
        tabBtnToken = true;
      }
    }
    break;
    // END Subgrid
  }

  if (tabBtnToken) {
    if (newAction.parent == actions.type) {
      actions.type = "null";

      newAction.target.classList.remove("btn-selected");
    } else {
      actions.type = newAction.parent;

      if (document.querySelector(".sidebar-left .btn-selected, .sidebar-right .btn-selected")) {
        document.querySelector(".sidebar-left .btn-selected, .sidebar-right .btn-selected").classList.remove("btn-selected");
        $(".sidebar-left .collapse.show, .sidebar-right .collapse.show").collapse("hide");
      }

      newAction.target.classList.add("btn-selected");
    }
  }

  cellBuilder();
}

//Add event listeners to controls
for (target of document.querySelectorAll(".action-controls")) {
  switch (target.type) {
    case "textarea":
    target.addEventListener("keyup", () => addAction(event) );
    break;

    case "number":
    case "file":
    case "color":
    target.addEventListener("change", () => addAction(event) );
    break;

    default:
    target.addEventListener("click", () => addAction(event) );
  }
}

//Add event listeners to sidebar toggles
for (target of document.querySelectorAll(".btn-toggle-left, .btn-toggle-right")) {
  target.addEventListener("click", () => toggleSide(event) );
}

getCell = function (posX, posY, supercell) {
  if (supercell) {
    if (supercell.subcell.datas[posY] && supercell.subcell.datas[posY][posX]) {
      return supercell.subcell.datas[posY][posX];
    }
  } else {
    if (gridObject.gridHolder[posY] && gridObject.gridHolder[posY][posX]) {
      return gridObject.gridHolder[posY][posX];
    }
  }
}

getCellArea = function (origin, sizeX, sizeY) {
  var cellArea = [];
  var collectGrid=[];
  var xIndex, yIndex;
  var offsetWidth = offsetHeight = 0;

  if (sizeX>1) {
    if (sizeX%2) {
      offsetWidth = (sizeX-1)/2;
    } else {
      offsetWidth = sizeX/2-1;
    }
  }

  if (sizeY>1) {
    if (sizeY%2) {
      offsetHeight = (sizeY-1)/2;
    } else {
      offsetHeight = sizeY/2-1;
    }
  }

  if (origin.type()!="subcell") {
    collectGrid=gridObject.gridHolder;
    xIndex=origin.pos.x;
    xIndex-offsetWidth < 0 ? offsetWidth = xIndex : null ;
    yIndex=origin.pos.y;
    yIndex-offsetHeight < 0 ? offsetHeight = yIndex : null ;
  } else {
    var superGrid=getCellArea(origin.supercell.data, Math.ceil(sizeX/2+1),Math.ceil(sizeY/2+1));
    for (var row of superGrid) {
      var collectRow=[[],[]];
      for (var cell of row) {
        if (cell.subcell.datas.length) {
          collectRow[0] = collectRow[0].concat(cell.subcell.datas[0]);
          collectRow[1] = collectRow[1].concat(cell.subcell.datas[1]);
        } else {
          collectRow[0] = collectRow[0].concat(null,null);
          collectRow[1] = collectRow[1].concat(null,null);
        }
      }
      collectGrid.push(collectRow[0]);
      collectGrid.push(collectRow[1]);
    }

    for (var row of collectGrid) {
      for (var cell of row) {
        if (cell==origin) {
          xIndex=row.indexOf(cell);
          yIndex=collectGrid.indexOf(row);
        }
      }
    }
  }


  for (var row of collectGrid.slice(yIndex-offsetHeight, yIndex-offsetHeight+sizeY)) {
    var cellRow = [];
    for (var cell of row.slice(xIndex-offsetWidth, xIndex-offsetWidth+sizeX)) {
      if (cell) {
        cellRow.push(cell);
      }
    }
    if (cellRow.length) {
      cellArea.push(cellRow);
    }
  }
  return cellArea;
}

getAdjCell = function (origin, direction) {
  var adj;
  var valueX=origin.pos.x;
  var valueY=origin.pos.y;

  switch (direction) {
    case "left":
    adj = getCell(origin.pos.x-1, origin.pos.y, origin.supercell.data);
    valueX=origin.pos.x-1;
    break;
    case "top":
    adj = getCell(origin.pos.x, origin.pos.y-1, origin.supercell.data);
    valueY=origin.pos.y-1;
    break;
    case "right":
    adj = getCell(origin.pos.x+1, origin.pos.y, origin.supercell.data);
    valueX=origin.pos.x+1;
    break;
    case "bottom":
    adj = getCell(origin.pos.x, origin.pos.y+1, origin.supercell.data);
    valueY=origin.pos.y+1;
    break;
  }

  if (!adj) {
    //search subcells
    switch (origin.type()) {
      case "subcell":
      valueX < 0 ? valueX = 1 : valueX > 1 ? valueX = 0 : null;
      valueY < 0 ? valueY = 1 : valueY > 1 ? valueY = 0 : null;

      var adjSuper;
      if (getAdjCell(origin.supercell.data, direction)) {
        adjSuper=getAdjCell(origin.supercell.data, direction);
      } else {
        adj=false;
      }

      if (adjSuper) {
        if (Array.isArray(adjSuper)) {
          for (var row of adjSuper) {
            for (var cell of row) {
              if (cell.pos.x==valueX && cell.pos.y==valueY) {
                adj=cell;
              }
            }
          }
        } else {
          adj=adjSuper;
        }
      }
      break;
      case "cell":
      adj=false;
      break;
    }
  }

  if (adj) {
    if (adj.subcell.datas.length) {
      switch (direction) {
        case "left":
        adj=getCellArea(adj.subcell.datas[0][1], 1, 2);
        break;
        case "top":
        adj=getCellArea(adj.subcell.datas[1][0], 2, 1);
        break;
        case "right":
        adj=getCellArea(adj.subcell.datas[0][0], 1, 2);
        break;
        case "bottom":
        adj=getCellArea(adj.subcell.datas[0][0], 2, 1);
        break;
      }
      var compositeAdj=[];
      for (row of adj) {
        var compositeRow=[];
        for (cell of row) {
          compositeRow.push(cell);
        }
        compositeAdj.push(compositeRow);
      }
      adj=compositeAdj;
    }
  }
  return adj;
}

previewAction = function (origin) {
  if (!origin.image) {
    var area = getCellArea(origin, 1, 1);

    if (actions.type=="brush" || actions.type=="erase" || actions.type=="image") {
      if (actions[actions.type].areaBrush || actions.type=="image") {
        area = getCellArea(origin, actions[actions.type].area.width, actions[actions.type].area.height);
      } else {
        area = getCellArea(origin, 1, 1);
      }
    }

    for (var row of area) {
      for (var cell of row) {
        if (cell) {
          if (!cell.image) {
            cell.element.classList.add("preview");
          }
        }
      }
    }
  } else {
    origin.image.element.classList.add("preview");
  }
}

editCell = function (target) {
  switch (actions.type) {

    //START Brush
    case "brush":
    {
      if (actions.brush.areaBrush) {
        targetCells = getCellArea(target, actions.brush.area.width, actions.brush.area.height);
      } else {
        targetCells = getCellArea(target, 1, 1);
      }

      if (target.image) {
        targetCells = target.image.anchor;
      }

      if (actions.brush.colorBrush) {
        for (var row of targetCells) {
          for (var cell of row) {
            if (!cell.subcell.datas.length) {
              cell.addColor(actions.brush.color);
            } else {
              for (var subRow of cell.subcell.datas) {
                for (var subCell of subRow) {
                  subCell.addColor(actions.brush.color);
                }
              }
            }
          }
        }
      }

      if (actions.brush.borderBrush) {
        for (var border in actions.brush.border) {
          if (actions.brush.border[border]) {
            switch (border) {
              case "left":
              for (var i = 0; i < targetCells.length; i++) {
                if (targetCells[i][0].subcell.datas.length) {
                  targetCells[i][0].subcell.datas[0][0].addBorder(border);
                  targetCells[i][0].subcell.datas[1][0].addBorder(border);
                } else {
                  targetCells[i][0].addBorder(border);
                }
                if (targetCells[i][0].type()=="cell" && Array.isArray(getAdjCell(targetCells[i][0], border))) {
                  for (var row of getAdjCell(targetCells[i][0], border)) {
                    for (var cell of row) {
                      if (cell.element.querySelector(".pseudo-border-"+direction)) {
                        cell.element.removeChild(cell.element.querySelector(".pseudo-border-"+border));
                        if (!cell.element.querySelector("[class*='pseudo-border'], .grid-image")) {
                          cell.element.style.position = "initial";
                        }
                      }
                    }
                  }
                }
              }
              break;

              case "top":
              for (var i = 0; i < targetCells[0].length; i++) {
                if (targetCells[0][i].subcell.datas.length) {
                  targetCells[0][i].subcell.datas[0][0].addBorder(border);
                  targetCells[0][i].subcell.datas[0][1].addBorder(border);
                } else {
                  targetCells[0][i].addBorder(border);
                }
                if (targetCells[0][i].type()=="cell" && Array.isArray(getAdjCell(targetCells[0][i], border))) {
                  for (var row of getAdjCell(targetCells[0][i], border)) {
                    for (var cell of row) {
                      if (cell.element.querySelector(".pseudo-border-"+direction)) {
                        cell.element.removeChild(cell.element.querySelector(".pseudo-border-"+border));
                        if (!cell.element.querySelector("[class*='pseudo-border'], .grid-image")) {
                          cell.element.style.position = "initial";
                        }
                      }
                    }
                  }
                }
              }
              break;

              case "right":
              for (var i = 0; i < targetCells.length; i++) {
                if (targetCells[i][targetCells[i].length-1].subcell.datas.length) {
                  targetCells[i][targetCells[i].length-1].subcell.datas[0][1].addBorder(border);
                  targetCells[i][targetCells[i].length-1].subcell.datas[1][1].addBorder(border);
                } else {
                  targetCells[i][targetCells[i].length-1].addBorder(border);
                }
              }
              break;

              case "bottom":
              for (var i = 0; i < targetCells[0].length; i++) {
                if (targetCells[targetCells.length-1][i].subcell.datas.length) {
                  targetCells[targetCells.length-1][i].subcell.datas[1][0].addBorder(border);
                  targetCells[targetCells.length-1][i].subcell.datas[1][1].addBorder(border);
                } else {
                  targetCells[targetCells.length-1][i].addBorder(border);
                }
              }
              break;
            }
          }
        }
      }
    }
    break;
    //END Brush

    //START Poi
    case "poi":
    {
      if (actions.poi.poiCreate) {
        if (!target.poi) {
          // Poi does not exist and is to be created
          var poi = new Poi(target, actions.poi.text, actions.poi.color);

          if (!target.image) {
            //There is no image present on the selected cell

            target.element.appendChild(poi.element);
            $(poi.element).tooltip();
          } else {
            //There is an image present on the selected cell

            poi.image=target.image;
            target.image.poi=poi;
            $(target.image.element).tooltip();
          }

          if (poi) {
            gridObject.poiHolder.push(poi);
          }
        } else {
          // Poi exists and is to be edited
          if (target.poi.text != actions.poi.text) {
            target.poi.addText(actions.poi.text);
          }

          if (target.poi.color != actions.poi.color) {
            target.poi.addColor(actions.poi.color);
          }
        }
      } else {
        if (target.poi) {
          // Poi exists and is to be removed

          if (!target.image) {
            //There is no image present on the selected cell
            $(target.poi.element).tooltip('dispose');
            target.poi.element.parentNode.removeChild(target.poi.element);
          } else {
            //There is an image present on the selected cell
            target.image.poi=null;
            target.image.element.removeAttribute("data-toggle");
            target.image.element.removeAttribute("data-trigger");
            target.image.element.removeAttribute("data-original-title");
          }

          gridObject.poiHolder.splice(gridObject.poiHolder.indexOf(target.poi),1);
          target.poi=null;
        }
      }
    }
    break;
    //END Poi

    //START Image
    case "image":
    {
      if (actions.image.imageCreate && actions.image.path) {
        if (!target.image && !target.poi) {
          var imageAllow=true;
          targetCells = getCellArea(target, actions.image.area.width, actions.image.area.height);

          if (targetCells.length<actions.image.area.height) {
            imageAllow=false;
          }

          for (var row of targetCells) {
            if (row.length<actions.image.area.width) {
              imageAllow=false;
            }
          }

          if (imageAllow) {
            var image=new Image(targetCells, actions.image.path, {x: actions.image.area.width, y: actions.image.area.height});

            image.anchor[0][0].element.appendChild(image.element);

            if (image) {
              gridObject.imageHolder.push(image);
            }
          }
        }
      } else {
        if (target.image) {
          target.image.element.parentNode.removeChild(target.image.element);

          for (var row of target.image.anchor) {
            for (var cell of row) {
              if (cell!=target) {
                cell.image=null;
              }
            }
          }

          gridObject.imageHolder.splice(gridObject.imageHolder.indexOf(target.image),1);
          target.image=null;
        }
      }
    }
    break;
    //END Image

    //START Subgrid
    case "subgrid":
    {
      if (actions.subgrid.subgridCreate) {
        if (target.type()!="subcell" && !target.image && !target.poi) {
          for (i = 0; i < 2; i++) {
            var rowEle = document.createElement("div");
            var row = [];
            $(rowEle).addClass("grid-row");
            for (ii = 0; ii < 2; ii++) {
              var subcell = new Cell(ii, i);
              $(subcell.element).addClass("grid-subcell");

              subcell.supercell.data=target;
              subcell.supercell.element=target.element;

              $(rowEle).append(subcell.element);
              row.push(subcell);
            }
            $(target.element).append(rowEle);

            target.subcell.elements.push(rowEle);
            target.subcell.datas.push(row);
          }

          //Pseudo border cleanup
          for (direction of ["left", "top"]) {
            var adj=getAdjCell(target, direction);
            if (Array.isArray(adj)) {
              for (var row of adj) {
                for (var cell of row) {
                  if (cell.element.querySelector("[class*='pseudo-border']")) {
                    switch (direction) {
                      case "left":
                      targetCells=getCellArea(target.subcell.datas[0][0],1,2);
                      var pseudoDir = "right";
                      break;
                      case "top":
                      targetCells=getCellArea(target.subcell.datas[0][0],2,1);
                      var pseudoDir = "bottom";
                      break;
                    }
                    for (var rowTarget of targetCells) {
                      for (var cellTarget of rowTarget) {
                        cellTarget.addBorder(direction);
                      }
                    }

                    cell.element.removeChild(cell.element.querySelector(".pseudo-border-"+pseudoDir));
                    if (!cell.element.querySelector("[class*='pseudo-border'], .grid-image")) {
                      cell.element.style.position = "initial";
                    }
                  }
                }
              }
            }
          }

          //Existing border assignment
          for (var direction in target.border) {
            if (target.border[direction]) {
              switch (direction) {
                case "left":
                targetCells=getCellArea(target.subcell.datas[0][0],1,2);
                break;
                case "top":
                targetCells=getCellArea(target.subcell.datas[0][0],2,1);
                break;
                case "right":
                targetCells=getCellArea(target.subcell.datas[0][1],1,2);
                break;
                case "bottom":
                targetCells=getCellArea(target.subcell.datas[1][0],2,1);
                break;
              }

              target.removeBorder(direction);
              if (actions.subgrid.preserve.borders) {
                for (var row of targetCells) {
                  for (var cell of row) {
                    cell.addBorder(direction);
                  }
                }
              }
            }
          }

          //Fill Subcells
          if (actions.subgrid.preserve.color) {
            if (target.paint.fill) {
              for (var row of target.subcell.datas) {
                for (var cell of row) {
                  cell.addColor(target.paint.color);
                }
              }
            }
          }

          target.element.classList.remove("preview");
          target.element.removeEventListener("click", target.events.cellClick);
          target.element.removeEventListener("mouseover", target.events.cellMouseover);
          target.element.removeEventListener("mouseout", target.events.cellMouseout);
          target.addColor("transparent");
        }
      } else {
        if (target.type()=="subcell") {
          var cell = target.supercell.data;

          while (cell.element.firstChild) {
            cell.element.removeChild(cell.element.firstChild);
          }
          cell.subcell.elements.splice(0,cell.subcell.elements.length);
          cell.subcell.datas.splice(0,cell.subcell.datas.length);

          cell.element.addEventListener("click", cell.events.cellClick);
          cell.element.addEventListener("mouseover", cell.events.cellMouseover);
          cell.element.addEventListener("mouseout", cell.events.cellMouseout);
          cell.addColor("lightgrey");
        }
      }
    }
    break;
    //END Subgrid

    //START Erase
    case "erase":
    {
      if (actions.erase.areaBrush) {
        targetCells = getCellArea(target, actions.erase.area.width, actions.erase.area.height);
      } else {
        targetCells = getCellArea(target, 1, 1);
      }

      if (target.image) {
        targetCells = target.image.anchor;
      }

      if (actions.erase.colorBrush) {
        for (var i = 0; i < targetCells.length; i++) {
          for (var ii = 0; ii < targetCells[i].length; ii++) {
            targetCells[i][ii].addColor('lightgrey');
            targetCells[i][ii].paint.fill = false
          }
        }
      }

      if (actions.erase.borderBrush) {
        for (var i = 0; i < targetCells.length; i++) {
          for (var ii = 0; ii < targetCells[i].length; ii++) {
            for (border in actions.erase.border) {
              if (actions.erase.border[border]) {
                targetCells[i][ii].removeBorder(border);
              }
            }
          }
        }
      }
    }
    break;
    //END Erase
  }
}

alterGrid = function (event) {
  var settings=document.querySelector(".settings-resizing");

  var newSettings = {
    bottom: parseInt( settings.querySelector("[action=bottom]").value ),
    top: parseInt( settings.querySelector("[action=top]").value ),
    left: parseInt( settings.querySelector("[action=left]").value ),
    right: parseInt( settings.querySelector("[action=right]").value )
  }

  if (!event.target.classList.contains("btn-apply")) {
    var newWidth =  gridObject.gridSize.width +  newSettings.left + newSettings.right;
    var newHeight = gridObject.gridSize.height + newSettings.top + newSettings.bottom;
    settings.querySelector(".settings-size-next").innerHTML= newWidth + "x" + newHeight;
  } else {
    var deleteCollect=[];

    for (var dir in newSettings) {
      switch (dir) {
        case "bottom":
        if (newSettings[dir] >= 0) {
          for (var i = 0; i < newSettings[dir]; i++) {
            var row=[];
            var rowElem=document.createElement("div");
            rowElem.classList.add("grid-row");
            for (var ii = 0; ii < gridObject.gridSize.width; ii++) {
              var cell = new Cell(0,0);
              row.push(cell);
              rowElem.appendChild(cell.element);
              cell.addColor("grey");
            }
            gridObject.gridHolder.push(row);
            document.getElementById("grid").appendChild(rowElem);
          }
        }
        break;

        case "top":
        if (newSettings[dir] >= 0) {
          for (var i = 0; i < newSettings[dir]; i++) {
            var row=[];
            var rowElem=document.createElement("div");
            rowElem.classList.add("grid-row");
            for (var ii = 0; ii < gridObject.gridSize.width; ii++) {
              var cell = new Cell(0,0);
              row.push(cell);
              rowElem.appendChild(cell.element);
              cell.addColor("grey");
            }
            gridObject.gridHolder.unshift(row);
            document.getElementById("grid").prepend(rowElem);
          }
        }
        break;

        case "left":
        if (newSettings[dir] >= 0) {
          for (var row of gridObject.gridHolder.filter(row => row.length < gridObject.gridSize.width + newSettings.left + (newSettings.right >0 ? newSettings.right : 0))) {
            for (var i = 0; i < newSettings[dir]; i++) {
              var cell = new Cell(0,0);
              row.unshift(cell);
              document.getElementById("grid").querySelector(".grid-row:nth-child(" + (gridObject.gridHolder.indexOf(row)+1) + ")").prepend(cell.element);
              cell.addColor("grey");
            }
          }
        }
        break;

        case "right":
        if (newSettings[dir] >= 0) {
          for (var row of gridObject.gridHolder.filter(row => row.length < gridObject.gridSize.width + (newSettings.left >=0 ? newSettings.left : 0) + newSettings.right)) {
            for (var i = 0; i < newSettings[dir]; i++) {
              var cell = new Cell(0,0);
              row.push(cell);
              document.getElementById("grid").querySelector(".grid-row:nth-child(" + (gridObject.gridHolder.indexOf(row)+1) + ")").appendChild(cell.element);
              cell.addColor("grey");
            }
          }
        }
        break;
      }
    }

    for (var dir in newSettings) {
      switch (dir) {
        case "bottom":
        if (newSettings[dir] < 0) {
          for (var row of gridObject.gridHolder.slice(newSettings[dir])) {
            for (var cell of row) {
              if (deleteCollect.indexOf(cell) < 0) {
                deleteCollect.push(cell);
              }
            }
          }
        }
        break;

        case "top":
        if (newSettings[dir] < 0) {
          for (var row of gridObject.gridHolder.slice(0,newSettings[dir] * -1)) {
            for (var cell of row) {
              if (deleteCollect.indexOf(cell) < 0) {
                deleteCollect.push(cell);
              }
            }
          }
        }
        break;

        case "left":
        if (newSettings[dir] < 0) {
          for (var row of gridObject.gridHolder) {
            for (var cell of row.slice(0,newSettings[dir] * -1)) {
              if (deleteCollect.indexOf(cell) < 0) {
                deleteCollect.push(cell);
              }
            }
          }
        }
        break;

        case "right":
        if (newSettings[dir] < 0) {
          for (var row of gridObject.gridHolder) {
            for (var cell of row.slice(newSettings[dir])) {
              if (deleteCollect.indexOf(cell) < 0) {
                deleteCollect.push(cell);
              }
            }
          }
        }
        break;
      }
    }

    //Cleanup deleted cells
    for (var cell of deleteCollect) {
      if (cell.image) {
        if (cell.image.poi) {
          $(cell.image.element).tooltip('dispose');
        }

        cell.image.element.parentNode.removeChild(cell.image.element);
        gridObject.imageHolder.splice(gridObject.imageHolder.indexOf(cell.image),1);
      }

      if (cell.poi) {
        $(cell.poi.element).tooltip('dispose');
        gridObject.poiHolder.splice(gridObject.poiHolder.indexOf(cell.poi),1);
      }

      cell.element.parentNode.removeChild(cell.element);

      var yIndex = gridObject.gridHolder.indexOf(gridObject.gridHolder.find(row => row.includes(cell) ));
      var xIndex = gridObject.gridHolder[yIndex].indexOf(cell);
      gridObject.gridHolder[yIndex].splice(xIndex,1);
    }

    //Cleanup empty rows
    for (var row of gridObject.gridHolder.filter(row => row.length == 0)) {
      gridObject.gridHolder.splice(gridObject.gridHolder.indexOf(row),1);
    }

    //Cleanup empty DOM rows
    for (var row of document.getElementById("grid").querySelectorAll(".grid-row:empty")) {
      document.getElementById("grid").removeChild(row);
    }

    // New cell positions
    for (var row of gridObject.gridHolder) {
      for (var cell of row) {
        cell.addPosition(row.indexOf(cell), gridObject.gridHolder.indexOf(row));
      }
    }

    // Update Grid Object
    gridObject.gridSize.width = gridObject.gridHolder[0].length;
    gridObject.gridSize.height = gridObject.gridHolder.length;

    grid.style.width = gridObject.gridSize.width * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["width"],10) + "px";
    grid.style.height = gridObject.gridSize.height * parseInt(getComputedStyle(grid.querySelector(".grid-cell"))["height"],10) + "px";

    grid.style.left = -(gridObject.gridDrag.dragData.gridSize.width() - gridObject.gridDrag.dragData.containerSize.width) / 2 + "px";
    grid.style.top = -(gridObject.gridDrag.dragData.gridSize.height() - gridObject.gridDrag.dragData.containerSize.height) / 2 + "px";

    // Cleanup grid size modal
    event.target.parentNode.parentNode.querySelector(".settings-size-current").innerHTML=gridObject.gridSize.width + "x" + gridObject.gridSize.height;
    event.target.parentNode.parentNode.querySelector(".settings-size-next").innerHTML=gridObject.gridSize.width + "x" + gridObject.gridSize.height;

    for (var input of event.target.parentNode.parentNode.querySelectorAll("input.settings-alter")) {
      input.value=0;
    }
  }
}

for (var input of document.getElementById("grid-size-modal").querySelectorAll(".settings-alter")) {
  switch (input.type) {
    case "number":
    input.addEventListener("change", () => alterGrid(event));
    break;

    case "button":
    input.addEventListener("click", () => alterGrid(event));
    break;
  }
}

$("#grid-size-modal").on("show.bs.modal", (event) => {
  event.target.querySelector(".settings-size-current").innerHTML=gridObject.gridSize.width + "x" + gridObject.gridSize.height;
  event.target.querySelector(".settings-size-next").innerHTML=gridObject.gridSize.width + "x" + gridObject.gridSize.height;

  for (var input of document.querySelectorAll("input.settings-alter")) {
    input.value=0;
  }
});

document.querySelector("#btn-save").addEventListener("click", function() {
  var gridSubmit = {
    id: 0,
    size_width: gridObject.gridSize.width,
    size_height: gridObject.gridSize.height,
    cells: [],
    poi: [],
    images: []
  }

  var cellId = 0, cellPoi = 0, cellImage = 0;
  function extractData(cell, superCell) {
    var collectSubmit = {
      cell: {
        id: cellId++,
        pos_X: cell.pos.x,
        pos_Y: cell.pos.y,
        borders: "",
        color: null
      }
    }

    if (superCell) {
      collectSubmit.cell.pos_X += "," + superCell.pos.x;
      collectSubmit.cell.pos_Y += "," + superCell.pos.y;
    }

    for (var dir in cell.border) {
      if (cell.border[dir]) {
        collectSubmit.cell.borders += dir + ",";
      } else {
        collectSubmit.cell.borders += "null,";
      }
    }
    collectSubmit.cell.borders = collectSubmit.cell.borders.slice(0, collectSubmit.cell.borders.length-1);

    collectSubmit.cell.color = cell.paint.fill ? cell.paint.color : "null";

    if (cell.image) {
      if ((cell.image.size.x == 1 && cell.image.size.y == 1) || (cell == cell.image.anchor[0][0])) {
        collectSubmit.image = {
          id: cellImage++,
          source: cell.image.source,
          size_width: cell.image.size.x,
          size_height: cell.image.size.y,
          idCell: collectSubmit.cell.id
        }

        if (cell.image.poi) {
          collectSubmit.image.idPoi = cellPoi;
        }
      }
    }

    if (cell.poi) {
      collectSubmit.poi = {
        id: cellPoi++,
        text: cell.poi.text,
        color: cell.poi.color,
        idCell: collectSubmit.cell.id
      };
    }

    return collectSubmit;
  }

  for (var i = 0; i < gridObject.gridHolder.length; i++) {
    for (var ii = 0; ii < gridObject.gridHolder[i].length; ii++) {
      var cell = gridObject.gridHolder[i][ii];
      var collectSubmit=[];

      if (cell.subcell.datas.length) {
        for (var subRow in cell.subcell.datas) {
          for (var subCell in cell.subcell.datas[subRow]) {
            collectSubmit.push(extractData(cell.subcell.datas[subRow][subCell], cell));
          }
        }
      }

      collectSubmit.push(extractData(cell));
      for (var iii = 0; iii < collectSubmit.length; iii++) {
        if (collectSubmit[iii].hasOwnProperty("image")) {
          gridSubmit.images.push(collectSubmit[iii].image);
        }
        if (collectSubmit[iii].hasOwnProperty("poi")) {
          gridSubmit.poi.push(collectSubmit[iii].poi);
        }
        gridSubmit.cells.push(collectSubmit[iii].cell);
      }
    }
  }


  console.log(gridSubmit);
  // console.log(JSON.stringify(gridObject));
  $.ajax({url: "server/gridOps.php" ,type: "POST", data: gridSubmit}).done(function(data) {
    $.ajax({url: "server/gridOps.php" ,type: "GET", data: {"idgrid":"0"}}).done(function(data) {
      // console.log(data);
      console.log(JSON.parse(data, function(key, value) {
        switch (key) {
          case "size_width":
          case "size_height":
          case "id":
          case "idPoi":
          case "idCell":
          case "idGrid":
          case "cell_idGrid":
            return parseInt(value);
            break;
          case "pos_X":
          case "pos_Y":
            if (value.split(",").length > 1) {
              var compVal = value.split(",");
              for (var i = 0; i < compVal.length; i++) {
                compVal[i] = parseInt(compVal[i]);
              }
              return compVal;
            } else {
              return parseInt(value);
            }
            break;
          default:
          return value;
        }
      }));
    });
  });
});
