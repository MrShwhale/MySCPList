const SCP_URL = "https://scp-wiki.wikidot.com/"


// Making the score selector
/** CODE FROM: https://stackoverflow.com/questions/4161369/html-color-codes-red-to-yellow-to-green, Ascendant's answer
 * Converts integer to a hexidecimal code, prepad's single 
 * digit hex codes with 0 to always return a two digit code. 
 * 
 * @param {Integer} i Integer to convert 
 * @returns {String} The hexidecimal code
 */
function intToHex(i) {
    var hex = parseInt(i).toString(16);
    return (hex.length < 2) ? "0" + hex : hex;
}   

/**
 * Return hex color from scalar *value*.
 *
 * @param {float} value Scalar value between 0 and 1
 * @return {String} color
 */
function makeColor(value) {
    // value must be between [0, 510]
    value = Math.min(Math.max(0,value), 1) * 510;

    var redValue;
    var greenValue;
    if (value < 255) {
        redValue = 255;
        greenValue = Math.sqrt(value) * 16;
        greenValue = Math.round(greenValue);
    } else {
        greenValue = 255;
        value = value - 255;
        redValue = 255 - (value * value / 255)
        redValue = Math.round(redValue);
    }

    return "#" + intToHex(redValue) + intToHex(greenValue) + "00";
}




function openInNewTab(url) {
  console.log("attempting to make " + url);
  chrome.tabs.create(
    {'url': url}
  );
}

// Marks the entry as read, or updates an existing entry. 
// Returns true if the entry was already in the list.
function markRead(url, title, authors, rating, notes, time) {
  
  console.log("URL: " + url);
  console.log("Title: " + title);
  console.log("Authors: " + authors);
  console.log("Rating: " + rating);
  console.log("Notes: " + notes);
  console.log("Time: " + time);
  

  // Entry format: [url, title, authors, rating, notes, enteredTime, updatedTime]
  // Store this data in the proper storage place (start with local for now)
  chrome.storage.local.get("completed").then((data) => {
    // If there are no entries, then instead of using existing entries use a blank list
    let entries = "completed" in data ? data["completed"] : [];
    let newEntry = [url, title, authors, rating, notes, time, time];
    
    // Check if there is already an entry made, then add/update it
    const existingIndex = entries.findIndex((element) => {return element[0] == newEntry[0]})

    if (existingIndex == -1) {
      entries.push(newEntry);
    }
    else {
      const oldTime = entries[existingIndex][6];
      newEntry[6] = oldTime;
      entries[existingIndex] = newEntry;
    }

    chrome.storage.local.set({"completed": entries});
  });
}

async function getActiveTab() {
  let queryOptions = {active: true, currentWindow: true};
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// Change the popup if the user is on the main page
document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTab();
  if (activeTab.url == SCP_URL) {
    const container = document.getElementsByClassName("new-entry")[0];

    container.innerHTML = '';
  }  
});

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

  document.getElementById("entry-button").addEventListener("click", async function() {
    // Get the rating and review from the user, and the author, date, title and url from the site

    let entryStatus = undefined;
    let entryMessage = undefined;

    try {
      const activeTab = await getActiveTab();

      const authors = (await chrome.tabs.sendMessage(activeTab.id, {type: "authorRequest"})).authorList;

      // If there is more than one author remove the "and " from the last one
      if (authors.length > 1) {
        authors[authors.length - 1] = authors[authors.length - 1].substring(4);
      }

      // Remove unneeded parts of the url and title
      const title = activeTab.title.substring(0, activeTab.title.lastIndexOf(" - SCP Foundation"));
      const url = activeTab.url.substring(SCP_URL.length);

      console.log(document.getElementsByClassName("selected-rating")[0].innerHTML)
      markRead(url, title, authors, parseInt(document.getElementsByClassName("selected-rating")[0].innerHTML), document.getElementById("notes-box").value, Date.now());
      
      // Tell the user that it was successful
      entryStatus = "successful-entry";

      // TODO change message text depending on update/addition
      // entryMessage = "Entry updated";
      entryMessage = "Entry added";
    } catch (e) {
      console.log(e.message);
      // Tell the user that it was unsuccessful, and advise reloading the page if it continues to do this
      entryMessage = "Entry failed";
      entryStatus = "failed-entry";
    }
    const notif = document.getElementById("entry-notification");
    notif.classList.add(entryStatus);
    notif.innerHTML = entryMessage;
  });
}

function makeScoreSelector() {
  const selector = document.getElementById("selector");
  for (let i = 1; i <= 10; i++) {
    const nextButton = document.createElement("button");
    nextButton.setAttribute("id", "select-" + i);
    nextButton.setAttribute("style", "background-color: " + makeColor((i-1)/10))
    nextButton.innerHTML = i;
    nextButton.addEventListener("click", function() {
      document.getElementsByClassName("selected-rating")[0].classList.remove("selected-rating");
      console.log("changed");
      nextButton.classList.add("selected-rating");
    })

    if (i == 5) {
      nextButton.classList.add("selected-rating");
    }
    selector.appendChild(nextButton);
  }

}

makeScoreSelector();
addButtonListeners();
