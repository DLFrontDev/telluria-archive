//Text to anchor control
var targetRange = {
  anchorNode: null,
  minOffset: null,
  maxOffset: null,
  text: null
};

function initializeAnchorInput () {
  if (window.getSelection().type=="Range") {
    targetRange.anchorNode=window.getSelection().anchorNode;
    targetRange.minOffset=window.getSelection().anchorOffset;
    targetRange.maxOffset=window.getSelection().focusOffset;
    targetRange.text=window.getSelection().toString();
    $("#anchor-input-modal").modal("show");
  }
}
function addAnchor () {
  var targetHref = document.querySelector("#anchor-input-modal input").value;
  var link = document.createElement("a");
  link.setAttribute("href", targetHref);
  link.innerHTML = targetRange.text;
  // Accounting for caret position in selection, else processes caret at beginning
  if (targetRange.maxOffset-targetRange.minOffset >= 0) {
    var splitNode = targetRange.anchorNode.splitText(targetRange.minOffset);
    targetRange.anchorNode.parentNode.insertBefore(link, splitNode);
    splitNode.splitText(targetRange.maxOffset-targetRange.minOffset);
    splitNode.parentNode.removeChild(splitNode);
  } else {
    var splitNode = targetRange.anchorNode.splitText(targetRange.maxOffset);
    targetRange.anchorNode.parentNode.insertBefore(link, splitNode);
    splitNode.splitText(targetRange.minOffset-targetRange.maxOffset);
    splitNode.parentNode.removeChild(splitNode);
  }
  $("#anchor-input-modal").modal("hide");
}

document.querySelector("#anchor-input-modal .btn").addEventListener("click", function () {addAnchor()});

//Delete Element control
function deleteElement(event) {
  var target = event.target;
  while (!target.classList.contains("workshop-node") && !target.classList.contains("article-main")) {
    target = target.parentNode;
  }
  if (!target.classList.contains("article-main")) {
    target.parentNode.removeChild(target);
  }
}

//Add Elements
function elementVendor(request, options) {
  var element;
  switch (request) {
    case "chapter":
      //Base chapter and col
      element = document.createElement("div");
      element.classList.add("workshop-node", "workshop-sortable-l1");
      heading = document.createElement("h4");
      heading.classList.add("workshop-editable");
      heading.innerHTML = "Chapter Title";
      heading.setAttribute("contenteditable", true);

      element.appendChild(heading);
      element.appendChild(controlsVendor(["sort","delete"]));
      break;
    case "paragraph":
      element = document.createElement("div");
      element.classList.add("workshop-node");
      element.innerHTML = "<p class='workshop-editable workshop-paragraph'>Editable Text</p>";
      element.classList.add("workshop-sortable-l1");

      element.appendChild(controlsVendor(["sort","delete","link"]));
      break;
    case "image":
      element = document.createElement("div");
      element.classList.add("card-column", "float-right", "workshop-node");
      element.innerHTML = "<div class='img-holder'> <div class='card'> <img class='card-img-top' src='images/default.png' alt='Card image cap'> <div class='card-header img-title'> <p class='workshop-editable'>Image Title</p> </div> <div class='img-text workshop-node'> <p class='workshop-editable'>Image description</p> </div> </div> </div>";

      element.classList.add("workshop-sortable-l1");

      element.querySelector(".card-header").appendChild(controlsVendor(["sort","delete","image","left-float","right-float"]));
      element.querySelector(".img-text").appendChild(controlsVendor(["link"]));
      break;
    case "info":
      element = document.createElement("div");
      element.classList.add("card-column", "float-right", "workshop-node");
      element.innerHTML ="<div class='info-holder'> <div class='card'> <div class='card-header info-title'> <p class='workshop-editable'>Info Title</p> </div> <img class='card-img-top' src='images/default.png' alt='Card image cap'> <div class='card-body'> <p class='text-center workshop-editable'>Description</p> <ul class='info-list'> </ul> </div> </div> </div>";

      element.classList.add("workshop-sortable-l1");
      element.querySelector(".info-list").appendChild(elementVendor("list-data"));

      element.querySelector(".card-header").appendChild(controlsVendor(["sort","delete","image","left-float","right-float"]));
      element.querySelector(".info-list").appendChild(addsVendor(["text", "list"], element.querySelector(".info-list")));
      break;
    case "list-data":
      element = document.createElement("li");
      element.classList.add("workshop-node");
      element.innerHTML = "<p class='list-header workshop-editable'>Property</p> <p class='list-data workshop-editable'>Description</p>";

      element.classList.add("workshop-sortable-l2");

      element.appendChild(controlsVendor(["sort","delete","link"]));
      break;
    case "list-data-list":
      element = document.createElement("li");
      element.classList.add("workshop-node");
      element.innerHTML = "<p class='list-header workshop-editable'>Property</p> <ul class='list-data workshop-node'> </ul>";

      element.classList.add("workshop-sortable-l2");
      element.querySelector(".list-data").appendChild(elementVendor("list-data-list-item"));

      element.appendChild(controlsVendor(["sort","delete","link"]));
      element.querySelector(".list-data").appendChild(addsVendor(["text"], element.querySelector(".list-data")));
      break;
    case "list-data-list-item":
      element = document.createElement("li");
      element.classList.add("sub-list-data", "workshop-node");
      element.innerHTML = "<p class='workshop-editable'>Description</p>";

      element.classList.add("workshop-sortable-l3");

      element.appendChild(controlsVendor(["sort","delete","link"]));

      break;
    case "related":
      element = document.createElement("li");
      element.classList.add("workshop-node", "workshop-sortable-l2");
      element.innerHTML = "<div class='related-link-box-head'><p class='workshop-editable'>Group Title</p></div> <div class='related-link-box-text workshop-node'><p class='workshop-editable'>Links</p></div>";

      element.querySelector(".related-link-box-head").appendChild(controlsVendor(["sort", "delete"]));
      element.querySelector(".related-link-box-text").appendChild(controlsVendor(["link"]));
      break;
  }

  if (element.querySelector(".workshop-editable")) {
    for (var node of element.querySelectorAll(".workshop-editable")) {
      node.setAttribute("contenteditable", "true");
    }
  }

  return element;
}

function addElement() {
  var location = event.target.parentNode.parentNode.parentNode;
  var targetBefore = event.target.parentNode.parentNode;
  var option = event.target;
  var appendElement;

  switch (true) {
    case (location.classList.contains("article-body")):
      switch (true) {
        case (option.classList.contains("workshop-add-chapter")):
          appendElement = elementVendor("chapter");
          break;
        case (option.classList.contains("workshop-add-text")):
          appendElement = elementVendor("paragraph");
          break;
        case (option.classList.contains("workshop-add-list")):
          appendElement = elementVendor("info");
          break;
        case (option.classList.contains("workshop-add-image")):
          appendElement = elementVendor("image");
          break;
      }
      break;
    case (location.classList.contains("info-list")):
      switch (true) {
        case (option.classList.contains("workshop-add-text")):
        appendElement = elementVendor("list-data");
        break;
        case (option.classList.contains("workshop-add-list")):
        appendElement = elementVendor("list-data-list");
        break;
      }
      break;
    case (location.classList.contains("list-data")):
      switch (true) {
        case (option.classList.contains("workshop-add-text")):
        appendElement = elementVendor("list-data-list-item");
        break;
      }
      break;
    case (location.classList.contains("related-list")):
      appendElement = elementVendor("related");
      break;
  }
  if (appendElement) {
    location.insertBefore(appendElement, targetBefore);
  }
  switch (true) {
    case (location.classList.contains("article-body")):
      attributeSortables.sortableElement.articleBody();
      break;
    case (location.classList.contains("article-chapter-text")):
      attributeSortables.sortableElement.chapter();
      break;
    case (location.classList.contains("info-list")):
      attributeSortables.sortableElement.info();
      break;
    case (location.classList.contains("list-data")):
      attributeSortables.sortableElement.infoList();
      break;
    case (location.classList.contains("related-list")):
      attributeSortables.sortableElement.related();
      break;
  }
}

//Float Toggle control
function floatCard(event) {
  var target = event.target;
  while (!target.classList.contains("card-column")) {
    target = target.parentNode;
  }
  target.classList.toggle("float-right");
  target.classList.toggle("float-left");
}

//Image src control
var targetImg = {
  img: null
}
function initializeSrcInput (event) {
  var target = event.target;
  while (!target.classList.contains("card-column")) {
    target = target.parentNode;
  }
  targetImg.img = target.querySelector(".card-img-top");
  $("#src-input-modal").modal("show");
}
function imgSrc(event) {
  var targetSrc = document.querySelector("#src-input-modal input").value;
  targetImg.img.setAttribute("src", targetSrc);

  $("#src-input-modal").modal("hide");
}

document.querySelector("#src-input-modal .btn").addEventListener("click", function () {imgSrc()});

//Addition Controls
function controlsVendor (controlClassArray) {
  var rootDiv = document.createElement("div");
  rootDiv.classList.add("workshop-controls");
  rootDiv.appendChild(document.createElement("ul"));

  for (var control of controlClassArray) {
    var controlEl = document.createElement("li");
    controlEl.classList.add("workshop-controls-" + control);
    controlEl.appendChild(document.createElement("i"));

    switch (control) {
      case "sort":
        controlEl.firstElementChild.classList.add("fa", "fa-arrows-alt-v");
        break;
      case "delete":
        controlEl.firstElementChild.classList.add("fa", "fa-times");
        controlEl.addEventListener("mousedown", function() {deleteElement(event)});
        break;
      case "link":
        controlEl.firstElementChild.classList.add("fa", "fa-link");
        controlEl.addEventListener("mousedown", function() {initializeAnchorInput()});
        break;
      case "image":
        controlEl.firstElementChild.classList.add("fa", "fa-image");
        controlEl.addEventListener("mousedown", function(event) {initializeSrcInput(event)});
        break;
      case "left-float":
        controlEl.firstElementChild.classList.add("fa", "fa-caret-left");
        controlEl.addEventListener("mousedown", function() {floatCard(event)});
        break;
      case "right-float":
        controlEl.firstElementChild.classList.add("fa", "fa-caret-right");
        controlEl.addEventListener("mousedown", function() {floatCard(event)});
        break;
    }

    rootDiv.firstElementChild.appendChild(controlEl);
  }

  return rootDiv;
}

function addsVendor (addClassArray, node) {
  if (node.tagName == "UL") {
    var rootDiv = document.createElement("li");
  } else {
    var rootDiv = document.createElement("div");
  }

  var appendTarget = node.parentNode;
  rootDiv.classList.add("workshop-add");
  rootDiv.appendChild(document.createElement("ul"));

  for (var control of addClassArray) {
    var controlEl = document.createElement("li");
    controlEl.innerHTML="+";
    controlEl.classList.add("workshop-add-" + control);

    switch (control) {
      case "text":
        controlEl.innerHTML+="T";
        break;
      case "image":
        controlEl.appendChild(document.createElement("i"));
        controlEl.firstElementChild.classList.add("fa", "fa-image");
        break;
      case "list":
        controlEl.appendChild(document.createElement("i"));
        controlEl.firstElementChild.classList.add("fa", "fa-list");
        break;
      case "chapter":
        controlEl.innerHTML+="CH";
        break;
      case "sub-chapter":
        controlEl.innerHTML+="SC";
        break;
    }

    controlEl.addEventListener("click", function(event) { addElement() });
    rootDiv.firstElementChild.appendChild(controlEl);
  }

  return rootDiv;
}

function initializePage () {

  for (var node of document.querySelector(".article-main").querySelectorAll("p, h2, h4, h5")) {
    node.classList.add("workshop-editable");
    node.setAttribute("contenteditable", "true");
  }

  for (var i = 0; i < document.querySelectorAll(".article-body > p").length; i++) {
    document.querySelectorAll(".article-body > p")[i].classList.add("workshop-paragraph");
  }

  for (var i = 0; i < document.querySelectorAll(".article-body .card-column, .article-body .info-list li, .related-list > li:not(.related-link-box-title), .list-data").length; i++) {
    document.querySelectorAll(".article-body .card-column, .article-body .info-list li, .related-list > li:not(.related-link-box-title), .list-data")[i].classList.add("workshop-node");
  }

  for (var i = 0; i < document.querySelectorAll(".article-body p.workshop-paragraph, .article-body h4, .article-body h5").length; i++) {
    var node = document.querySelectorAll(".article-body p.workshop-paragraph, .article-body h4, .article-body h5")[i];
    var containerEl = document.createElement("div");
    containerEl.classList.add("workshop-node");
    node.parentNode.insertBefore(containerEl, node.nextElementSibling);
    containerEl.appendChild(node);
  }

  for (var i = 0; i < document.querySelectorAll(".article-body > .workshop-node").length; i++) {
    document.querySelectorAll(".article-body > .workshop-node")[i].classList.add("workshop-sortable-l1");
  }

  for (var i = 0; i < document.querySelectorAll(".info-list > li").length; i++) {
    document.querySelectorAll(".info-list > li")[i].classList.add("workshop-sortable-l2");
  }

  for (var i = 0; i < document.querySelectorAll(".list-data > li").length; i++) {
    document.querySelectorAll(".list-data > li")[i].classList.add("workshop-sortable-l3");
  }

  for (var i = 0; i < document.querySelectorAll(".related-link-box .related-list li:not(.related-link-box-title)").length; i++) {
    document.querySelectorAll(".related-link-box .related-list li:not(.related-link-box-title)")[i].classList.add("workshop-sortable-l2");
  }

  // Modify Elements Controls
  for (var node of document.querySelectorAll(".article-body h4, .article-body h5")) {
    node.parentNode.appendChild(controlsVendor(["sort","delete"]));
  }

  for (var node of document.querySelectorAll(".workshop-paragraph, .list-header")) {
    node.parentNode.appendChild(controlsVendor(["sort","delete","link"]));
  }

  for (var node of document.querySelectorAll(".card-header")) {
    node.appendChild(controlsVendor(["sort","delete","image","left-float","right-float"]));
  }

  for (var node of document.querySelectorAll(".img-text")) {
    node.appendChild(controlsVendor(["link"]));
  }

  for (var node of document.querySelectorAll(".sub-list-data")) {
    node.appendChild(controlsVendor(["sort","delete","link"]));
  }

  for (var node of document.querySelectorAll(".related-link-box-head")) {
    node.appendChild(controlsVendor(["sort","delete"]));
  }

  for (var node of document.querySelectorAll(".related-link-box-text")) {
    node.appendChild(controlsVendor(["link"]));
  }

  // Add Elements Controls
  for (var node of document.querySelectorAll(".article-body")) {
    node.appendChild(addsVendor(["chapter", "sub-chapter", "text", "image", "list"], node));
  }

  for (var node of document.querySelectorAll(".info-holder .info-list")) {
    node.appendChild(addsVendor(["text", "list"], node));
  }

  for (var node of document.querySelectorAll(".info-holder .info-list ul.list-data")) {
    node.appendChild(addsVendor(["text"], node));
  }

  for (var node of document.querySelectorAll(".related-link-box .col > ul")) {
    node.appendChild(addsVendor(["list"], node));
  }
}

attributeSortables = {
  sortableElement: {
    articleBody: function () {
      $( ".article-body" ).sortable({
        axis: "y",
        items: ".workshop-sortable-l1",
        handle: ".workshop-controls .workshop-controls-sort"
      });
    },
    info: function () {
      $( ".info-list" ).sortable({
        axis: "y",
        items: ".workshop-sortable-l2",
        handle: ".workshop-controls .workshop-controls-sort"
      });
    },
    infoList: function () {
      $( "ul.list-data" ).sortable({
        axis: "y",
        items: ".workshop-sortable-l3",
        handle: ".workshop-controls .workshop-controls-sort"
      });
    },
    related: function () {
      $( ".related-link-box ul" ).sortable({
        axis: "y",
        items: ".workshop-sortable-l2",
        handle: ".workshop-controls .workshop-controls-sort"
      });
    }
  },
  allSortables: function() {
    for (var i in attributeSortables.sortableElement) {
      attributeSortables.sortableElement[i]();
    }
  }
}

initializePage();
attributeSortables.allSortables();


document.querySelector("#uploadFile").addEventListener("change", function(event) {
  var list = event.target.parentNode.parentNode.querySelector(".upload-holder");
  for (var file of event.target.files) {
    var item = document.createElement("li");
    item.innerHTML=file.name;
    list.appendChild(item);
  }
});

document.querySelector(".btn-upload").addEventListener("click", function(event) {
    event.target.parentNode.querySelector(".upload-holder").innerHTML="";
});

function clearWorkshop() {
  for (var node of document.querySelectorAll(".workshop-editable")) {
    node.removeAttribute("contenteditable");
    node.classList.remove("workshop-editable");
  }

  for (var node of document.querySelectorAll(".workshop-node")) {
    node.classList.remove("workshop-node");
  }

  for (var node of document.querySelectorAll(".workshop-paragraph")) {
    node.removeAttribute("class");
    node.parentNode.parentNode.insertBefore(node.cloneNode(true), node.parentNode);
    node.parentNode.parentNode.removeChild(node.parentNode);
  }

  for (var node of document.querySelectorAll(".workshop-controls, .workshop-add")) {
    node.parentNode.removeChild(node);
  }

  $(".ui-sortable").sortable("destroy");
  for (var i = 1; i <= 5; i++) {
    for (var node of document.querySelectorAll(".workshop-sortable-l"+i)) {
      node.classList.remove("workshop-sortable-l"+i);
    }
  }
}

document.querySelector(".btn-save").addEventListener("click", function () {clearWorkshop()});
