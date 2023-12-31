const SCP_URL = "https://scp-wiki.wikidot.com/"
let already_existing = false;


// Making the score selector
/** CODE FROM: https://stackoverflow.com/questions/4161369/html-color-codes-red-to-yellow-to-green, Ascendant's answer
* Converts integer to a hexidecimal code, prepad's single 
* digit hex codes with 0 to always return a two digit code. 
* 
* @param {Integer} i Integer to convert 
* @returns {String} The hexidecimal code
*/
function intToHex(i) {
    let hex = parseInt(i).toString(16);
    return (hex.length < 2) ? "0" + hex : hex;
}   

/** CODE FROM: https://stackoverflow.com/questions/4161369/html-color-codes-red-to-yellow-to-green, Ascendant's answer
* Return hex color from scalar *value*.
*
* @param {float} value Scalar value between 0 and 1
* @return {String} color
*/
function makeColor(value) {
    // value must be between [0, 510]
    value = Math.min(Math.max(0,value), 1) * 510;

    let redValue;
    let greenValue;
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
    chrome.tabs.create(
        {'url': url}
    );
}

// Marks the entry as read, or updates an existing entry. 
    // If rating is false, then it adds it to the "to read" list instead
function markRead(listName, url, title, authors, rating, notes, time) {
    /*
        console.log("URL: " + url);
    console.log("Title: " + title);
    console.log("Authors: " + authors);
    console.log("Rating: " + rating);
    console.log("Notes: " + notes);
    console.log("Time: " + time);
    */

    // Entry format: [url, title, authors, rating, notes, enteredTime, updatedTime]
    // readinglist is the same, but no rating
    // Store this data in the proper storage place (start with local for now)
    chrome.storage.local.get(null).then((data) => {
        // If there are no entries, then instead of using existing entries use a blank list
        let entries = listName in data ? data[listName] : [];
        let newEntry = [url, title, authors, rating, notes, time, time];

        // Check if there is already an entry made, then add/update it
        const existingIndex = entries.findIndex((element) => {return element[0] == newEntry[0]})

        // Remove this from the other list if it exists in it
        const otherListName = listName == "completed" ? "toRead" : "completed";
        let otherEntries = otherListName in data ? data[otherListName] : [];
        const newOther = otherEntries.filter((element) => {return element[0] != url});
        chrome.storage.local.set({[otherListName]: newOther});

        if (existingIndex == -1) {
            entries.unshift(newEntry);
        }
        else {
            const oldTime = entries[existingIndex][6];
            newEntry[6] = oldTime;
            entries[existingIndex] = newEntry;
        }

        chrome.storage.local.set({[listName]: entries});
    });
}

async function addEntry() {
    // Get the rating and review from the user, and the author, date, title and url from the site
    let entryStatus;
    let entryMessage;

    try {
        const activeTab = await getActiveTab();

        let authors = (await chrome.tabs.sendMessage(activeTab.id, {type: "authorRequest"}));
        authors = authors.authorList;

        // Remove unneeded parts of the url and title
        const title = activeTab.title.substring(0, activeTab.title.lastIndexOf(" - SCP Foundation"));
        const url = activeTab.url.substring(SCP_URL.length);

        if (this.getAttribute("id") == "entry-button") {
            markRead("completed", url, title, authors, parseInt(document.getElementsByClassName("selected-rating")[0].innerHTML), document.getElementById("notes-box").value, Date.now());
        }
        else {
            markRead("toRead", url, title, authors, 0, document.getElementById("notes-box").value, Date.now());
        }

        // Tell the user that it was successful
        entryStatus = "successful-entry";

        if (already_existing) {
            entryMessage = "Entry updated";
        }
        else {
            entryMessage = "Entry added";
        }
    } catch (e) {
        console.log(e.message);
        // Tell the user that it was unsuccessful, and advise reloading the page if it continues to do this
        entryMessage = "Entry failed";
        entryStatus = "failed-entry";
    }
    const notif = document.getElementById("entry-notification");
    notif.classList.add(entryStatus);
    notif.innerHTML = entryMessage;
}

async function getActiveTab() {
    let queryOptions = {active: true, currentWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Change the popup if the user is on the main page or not on the wiki at all
document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTab();
    if (!activeTab.url.startsWith(SCP_URL) || activeTab.url == SCP_URL) {
        // Redirect to the nonwiki page
        window.location.href = "../pages/disabled.html";
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

    document.getElementById("entry-button").addEventListener("click", addEntry);

    document.getElementById("to-read-button").addEventListener("click", addEntry);
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
            nextButton.classList.add("selected-rating");
        })

        if (i == 5) {
            nextButton.classList.add("selected-rating");
        }
        selector.appendChild(nextButton);
    }

}

async function getExistingEntry() {
    const activeTabUrl = (await getActiveTab()).url.substring(SCP_URL.length);
    chrome.storage.local.get(null).then((data) => {
        const listNames = ["toRead", "completed"];
        for (const listName of listNames) {
            if (listName in data) {
                const existingIndex = data[listName].findIndex((element) => {return element[0] == activeTabUrl});
                if (existingIndex != -1) {
                    // Set notes to existing notes
                    document.getElementById("notes-box").innerHTML = data[listName][existingIndex][4];

                    // Set rating to existing rating, or keep default if on the reading list
                    const rating = data[listName][existingIndex][3];
                    if (rating > 0) {
                        document.getElementById("select-" + rating).click();
                    }

                    already_existing = true;
                    break;
                }
            }
        }
    });
}

makeScoreSelector();
addButtonListeners();
getExistingEntry();
