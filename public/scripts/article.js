loadAnchors = function(linkBox) {
  var chapters = document.querySelectorAll(".article-body h4, .article-body h5");
  var chN = 0, subChN = 0;
  ChapterAnchor = function (anchorNumber, text) {
    var baseListItem = document.createElement("li");
    baseListItem.classList.add("list-item");

    var anchor = document.createElement("a");
    anchor.href= "#"+anchorNumber;

    var listItemNumber = document.createElement("span");
    listItemNumber.classList.add("list-item-number");
    listItemNumber.innerHTML=anchorNumber+". ";

    var listItemTitle = document.createTextNode(text);

    anchor.appendChild(listItemNumber);
    anchor.appendChild(listItemTitle);

    baseListItem.appendChild(anchor);

    return baseListItem;
  }

  for (var i = 0; i < chapters.length; i++) {
    if (chapters[i].tagName == "H4") {
      subChN = 1;
      chN += 1;
      var chapterAnchor = new ChapterAnchor(chN, chapters[i].textContent);
      chapters[i].id = chN;
      linkBox.appendChild(chapterAnchor);
    } else  {
      var anchor = new ChapterAnchor(chN + "." + subChN, chapters[i].textContent);
      var subList = document.createElement("ul");
      chapters[i].id = chN + "." + subChN;
      if (chapterAnchor.querySelector("ul")) {
        chapterAnchor.querySelector("ul").appendChild(anchor)
      } else {
        subList.appendChild(anchor);
        chapterAnchor.appendChild(subList);
      }
      subChN += 1;
    }
  }

  if (document.querySelector("#related")) {
    var relatedLink = new ChapterAnchor(chN+1, document.querySelector("#related .related-link-box-title").textContent);
    relatedLink.querySelector("a").href="#related";
    linkBox.appendChild(relatedLink);
  }
}

for (var linkBox of document.querySelectorAll(".sidebar-menu .nav-list-article")) {
  loadAnchors(linkBox);
}
