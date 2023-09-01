function openInNewTab(url) {
  console.log("attempting to make " + url);
  chrome.tabs.create(
    {'url': url}
  );
}

// Change the popup if the user is on the main page or not on the wiki at all
function addButtonListeners() {
  document.getElementById("list-button").addEventListener("click", function() {
    openInNewTab("../pages/lists.html");
  });

  document.getElementById("rec-button").addEventListener("click", function() {
    openInNewTab("../pages/recommendations.html");
  });

  document.getElementById("option-button").addEventListener("click", function() {
    openInNewTab("../pages/options.html");
  });

}

addButtonListeners();
