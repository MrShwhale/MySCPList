// First, add all of the lists that currently exist as buttons
// Then, load the first list's entries
// Change these entries when a different list button is pressed

const SCP_URL = "https://scp-wiki.wikidot.com/"

const toggleRow = (element) => {
  element.target.closest("tr").getElementsByClassName('expanded-row-content')[0].classList.toggle('hide-row');
}

const headerCompFns = {
    "Title": (a, b) => {return a[1].localeCompare(b[1])},
    "Author(s)": (a, b) => {return a[0][2].localeCompare(b[0][2])},
    "Rating": (a, b) => {return a[3] - (b[3])},
    "Entry Updated": (a, b) => {return a[5] - (b[5])},
    "Entry Added": (a, b) => {return a[6] - (b[6])}
}

function clearEntries() {
    const tableBody = document.getElementById("list-table").firstChild;
    
    while (tableBody.childNodes.length > 1) {
        tableBody.removeChild(tableBody.lastChild);
    }
}

function clearList() {
    const table = document.getElementById("list-table");
    table.innerHTML = "";
}

function displayEntries(listName, sortmode, sortFunc) {
    clearEntries();

    const listTable = document.getElementById("list-table");

    chrome.storage.local.get(listName).then((data) => {
        // Completed entry format: [url, title, authors, rating, notes, enteredTime, updatedTime]
        let entries = listName in data ? data[listName] : [];

        if (sortmode) {
            entries.sort(sortFunc);
        }
        
        if (sortmode == -1) {
            entries.reverse();
        }

        for (let i = 0; i < entries.length; i++) {
            // Make an element out of this entry
            // Add the row to the table
            const entryRow = listTable.insertRow(-1);

            // Page title which is linked to the page
            const pageTitleCell = entryRow.insertCell(0);
            const pageTitle = document.createElement("p");
            const pageLink = document.createElement("a");
            pageLink.setAttribute("href", SCP_URL + entries[i][0]);
            pageLink.innerHTML = entries[i][1];
            pageTitle.appendChild(pageLink);
            pageTitleCell.appendChild(pageTitle);

            // Authors
            const authorsCell = entryRow.insertCell(1);
            const authors = document.createElement("p");
            authors.innerHTML = entries[i][2].join(", ");
            authorsCell.appendChild(authors);

            // Rating
            const ratingCell = entryRow.insertCell(2);
            const rating = document.createElement("p");
            rating.innerHTML = entries[i][3] ? entries[i][3].toString() : "None";
            ratingCell.appendChild(rating);

            // Entered time
            const enteredTimeCell = entryRow.insertCell(3);
            const enteredTime = document.createElement("p");
            enteredTime.innerHTML = new Date(entries[i][5]).toLocaleString();
            enteredTimeCell.appendChild(enteredTime);

            // Updated time
            const updatedTimeCell = entryRow.insertCell(4);
            const updatedTime = document.createElement("p");
            updatedTime.innerHTML = new Date(entries[i][6]).toLocaleString();
            updatedTimeCell.appendChild(updatedTime);

            // Notes (hidden)
            const notesCell = entryRow.insertCell(5);
            const notes = document.createElement("p");
            notes.innerHTML = entries[i][4];
            notesCell.appendChild(notes);
            notesCell.classList.add("expanded-row-content");
            notesCell.classList.add("hide-row");

            entryRow.addEventListener("click", toggleRow);
        }
    });
}

function displayList(listName) {

    const listTable = document.getElementById("list-table");

    const HEADERS = ["Title", "Author(s)", "Rating", "Entry Updated", "Entry Added"];

    const headerRow = listTable.insertRow(-1);

    const removeSortClasses = () => {
        // TODO refactor this so it doesn't look like baby's first js
        const ascendings = document.getElementsByClassName("sort-ascending");
        if (ascendings.length > 0) {
            ascendings[0].classList.remove("sort-ascending");
        }
        else {
            const descendings = document.getElementsByClassName("sort-descending");
            if (descendings.length > 0) {
                descendings[0].classList.remove("sort-descending");
            }
        }
    }

    for (const header of HEADERS) {
        const headerElement = document.createElement("th");
        // Sortmodes: 0 = no sort, -1 is reverse, 1 is normal
        let sortmode = undefined;
        headerElement.addEventListener("click", function (e) {
            if (this.classList.contains("sort-ascending")) {
                this.classList.replace("sort-ascending", "sort-descending");
                sortmode = -1;
            }
            else if (this.classList.contains("sort-descending")) {
                this.classList.remove("sort-descending");
                // Since there would normally be no more sort, here indicate the default sort
                //document.getElementById("list-table").firstChild.firstChild.children.item(3).classList.add("sort-ascending");
                sortmode = 0;
            }
            else {
                removeSortClasses();
                sortmode = 1;
                this.classList.add("sort-ascending");
            }

            displayEntries(document.getElementsByClassName("selected-list")[0].getAttribute("id"), sortmode, headerCompFns[this.innerHTML]);
        });
        headerElement.innerHTML = header;
        headerRow.appendChild(headerElement);
    }

    // Default sort is by last updated
    headerRow.children.item(3).classList.add("sort-ascending");

    displayEntries(listName);
}

function addButtonListeners() {
    // for every button in the listbuttons thing, add an event to display that list
    for (const child of document.getElementsByClassName("list-buttons")[0].children) {
        child.addEventListener("click", (element) => {
            document.getElementsByClassName("selected-list")[0].classList.remove("selected-list");
            element.target.classList.add("selected-list");
            clearList();
            displayList(element.target.getAttribute("id"));
        })
    }
}

addButtonListeners();
displayList("completed");
