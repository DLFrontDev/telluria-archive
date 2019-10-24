var map = {
  markers:[],
  mapDrag: {
    dragging: false,
    dragData: {
      containerSize: {
        width: document.querySelector("#map-container").offsetWidth,
        height: document.querySelector("#map-container").offsetHeight
      },
      mapSize: {
        width: document.querySelector(".main-image").offsetWidth,
        height: document.querySelector(".main-image").offsetHeight
      },
      containerOffset: {
        top: document.querySelector("#map-container").getBoundingClientRect().top + document.body.scrollTop,
        left: document.querySelector("#map-container").getBoundingClientRect().left + document.body.scrollLeft
      },
      lastMousePos: {
        x: null,
        y: null
      }
    },
    events: {
      mapDragStart: function (event) {
        if (event.button==0) {
          map.mapDrag.dragging=true;
          /* Save mouse position */
          map.mapDrag.dragData.lastMousePos = { x: event.pageX - map.mapDrag.dragData.containerOffset.left, y: event.pageY - map.mapDrag.dragData.containerOffset.top };
        }
      },
      mapDragStop: function (event) {
        map.mapDrag.dragging=false;
      },
      mapDragMove: function (event) {
        if(map.mapDrag.dragging == true) {
          var currentMousePos = { x: event.pageX - map.mapDrag.dragData.containerOffset.left, y: event.pageY - map.mapDrag.dragData.containerOffset.top };
          var changeX = currentMousePos.x - map.mapDrag.dragData.lastMousePos.x;
          var changeY = currentMousePos.y - map.mapDrag.dragData.lastMousePos.y;

          /* Save mouse position */
          map.mapDrag.dragData.lastMousePos = currentMousePos;

          var mapTop = parseInt(getComputedStyle(document.querySelector("#map"))["top"],10);
          var mapLeft = parseInt(getComputedStyle(document.querySelector("#map"))["left"],10);

          var mapTopNew = mapTop + changeY;
          var mapLeftNew = mapLeft + changeX;

          /* Validate top and left do not fall outside the image, otherwise white space will be seen */
          if (map.mapDrag.dragData.mapSize.height > map.mapDrag.dragData.containerSize.height) {
            if(mapTopNew > 0) {
              mapTopNew = 0;
            }
            if(mapTopNew < (map.mapDrag.dragData.containerSize.height - map.mapDrag.dragData.mapSize.height)) {
              mapTopNew = map.mapDrag.dragData.containerSize.height - map.mapDrag.dragData.mapSize.height;
            }
            document.querySelector("#map").style.top = mapTopNew + 'px';
          }

          if (map.mapDrag.dragData.mapSize.width > map.mapDrag.dragData.containerSize.width) {
            if(mapLeftNew > 0) {
              mapLeftNew = 0;
            }
            if(mapLeftNew < (map.mapDrag.dragData.containerSize.width - map.mapDrag.dragData.mapSize.width)) {
              mapLeftNew = map.mapDrag.dragData.containerSize.width - map.mapDrag.dragData.mapSize.width;
            }
            document.querySelector("#map").style.left = mapLeftNew + 'px';
          }
        }
      }
    }
  },
  mapZoom: {
    events: {
      zoomIn: function () {
        var zoom = parseInt(document.querySelector("#map").getAttribute("data-zoom"));

        if (zoom<2) {
          document.querySelector("#map").setAttribute("data-zoom", zoom+1);

          map.style.width = map.mapSize.width * parseInt(getComputedStyle(map.querySelector(".map-cell"))["width"],10) + "px";
          map.style.height = map.mapSize.height * parseInt(getComputedStyle(map.querySelector(".map-cell"))["height"],10) + "px";

          map.style.left = -(map.mapDrag.dragData.mapSize.width - map.mapDrag.dragData.containerSize.width) / 2 + "px";
          map.style.top = -(map.mapDrag.dragData.mapSize.height - map.mapDrag.dragData.containerSize.height) / 2 + "px";
        }
      },
      zoomOut: function () {
        var zoom = parseInt(document.querySelector("#map").getAttribute("data-zoom"));

        if (zoom>0) {
          document.querySelector("#map").setAttribute("data-zoom", zoom-1);

          map.style.width = map.mapSize.width * parseInt(getComputedStyle(map.querySelector(".map-cell"))["width"],10) + "px";
          map.style.height = map.mapSize.height * parseInt(getComputedStyle(map.querySelector(".map-cell"))["height"],10) + "px";

          map.style.left = -(map.mapDrag.dragData.mapSize.width - map.mapDrag.dragData.containerSize.width) / 2 + "px";
          map.style.top = -(map.mapDrag.dragData.mapSize.height - map.mapDrag.dragData.containerSize.height) / 2 + "px";
        }
      }
    }
  }
}

document.querySelector("#map").style.left = -(map.mapDrag.dragData.mapSize.width - map.mapDrag.dragData.containerSize.width) / 2 + "px";
document.querySelector("#map").style.top = -(map.mapDrag.dragData.mapSize.height - map.mapDrag.dragData.containerSize.height) / 2 + "px";

document.querySelector("#map").addEventListener("mousedown", map.mapDrag.events.mapDragStart);
document.querySelector("#map").addEventListener("mousemove", map.mapDrag.events.mapDragMove);
window.addEventListener("mouseup", map.mapDrag.events.mapDragStop);

Marker = function (posX, posY, text) {
  this.pos = { x: posX, y: posY }
  this.text = text;
}

map.markers.push(
  new Marker(357, 74, "Joröheim"),
  new Marker(0, 162, "Ororongo"),
  new Marker(56, 498, "Kingdom City"),
  new Marker(932, 0, "Marker 4"),
  new Marker(1053, 253, "Marker 5")
);

for (var marker of map.markers) {
  var markerEl = document.createElement("a");
  markerEl.classList.add("marker");
  markerEl.setAttribute("href", "#");
  markerEl.style.left = marker.pos.x + "px";
  markerEl.style.top = marker.pos.y + "px";
  markerEl.innerHTML=marker.text;
  document.querySelector("#map .marker-holder").appendChild(markerEl);
}

for (var marker of map.markers) {
  var markerEl = document.createElement("a");
  markerEl.classList.add("marker");
  markerEl.setAttribute("href", "#");
  markerEl.style.left = marker.pos.x*2 + "px";
  markerEl.style.top = marker.pos.y*2 + "px";
  markerEl.innerHTML=marker.text;
  document.querySelector("#map2 .marker-holder").appendChild(markerEl);
}
