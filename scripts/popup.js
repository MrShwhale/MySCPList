const SCP_URL = "https://scp-wiki.wikidot.com/"

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

function createRatingElement() {
  const ratingParent = document.getElementById("rating-box")
  for (let i = 1; i < 11; i++) {
    ratingParent.appendChild(new Option(i,i));
  }
}

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

      markRead(url, title, authors, document.getElementById("rating-box").value, document.getElementById("notes-box").value, Date.now());
      
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

createRatingElement();
addButtonListeners();
