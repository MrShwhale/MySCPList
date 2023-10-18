const SCP_URL = "https://scp-wiki.wikidot.com/"

const toggleRow = (element) => {
  element.target.closest("tr").getElementsByClassName('expanded-row-content')[0].classList.toggle('hide-row');
}

// Functions used to compare various columns
const headerCompFns = {
    "Title": (a, b) => {return a[1].localeCompare(b[1])},
    "Author(s)": (a, b) => {return a[0][2].localeCompare(b[0][2])},
    "Rating": (a, b) => {return b[3] - a[3]},
    "Entry Updated": (a, b) => {return b[5] - a[5]},
    "Entry Added": (a, b) => {return b[6] - a[6]}
}

// Removes all entries from the HTML table body
// Used when changing sort modes
function clearEntries() {
    const tableBody = document.getElementById("list-table").firstChild;
    
    while (tableBody.childNodes.length > 1) {
        tableBody.removeChild(tableBody.lastChild);
    }
}

// Removes all entries from the HTML table, including headers
// Used for changing lists
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

        entries.sort(sortFunc)

        if (sortmode == -1) {
            entries.reverse();
        }


        for (let i = 0; i < entries.length; i++) {
            // Make an element out of this entry
            // Add the row to the table
            const entryRow = listTable.insertRow(-1);
            entryRow.setAttribute("id", "entry-" + i);

            // Page title which is linked to the page
            const pageTitleCell = entryRow.insertCell(0);
            const pageTitle = document.createElement("p");
            const pageLink = document.createElement("a");
            pageLink.setAttribute("href", SCP_URL + entries[i][0]);
            pageLink.innerHTML = entries[i][1];
            pageTitle.appendChild(pageLink);
            pageTitleCell.appendChild(pageTitle);
            pageTitleCell.addEventListener("click", toggleRow);

            // Authors
            const authorsCell = entryRow.insertCell(1);
            const authors = document.createElement("p");
            authors.innerHTML = entries[i][2].join(", ");
            authorsCell.appendChild(authors);
            authorsCell.addEventListener("click", toggleRow);

            // Rating
            const ratingCell = entryRow.insertCell(2);
            const rating = document.createElement("p");
            rating.innerHTML = entries[i][3] ? entries[i][3].toString() : "None";
            ratingCell.appendChild(rating);
            ratingCell.addEventListener("click", toggleRow);

            // Entered time
            const enteredTimeCell = entryRow.insertCell(3);
            const enteredTime = document.createElement("p");
            enteredTime.innerHTML = new Date(entries[i][5]).toLocaleString();
            enteredTimeCell.appendChild(enteredTime);
            enteredTimeCell.addEventListener("click", toggleRow);

            // Updated time
            const updatedTimeCell = entryRow.insertCell(4);
            const updatedTime = document.createElement("p");
            updatedTime.innerHTML = new Date(entries[i][6]).toLocaleString();
            updatedTimeCell.appendChild(updatedTime);
            updatedTimeCell.addEventListener("click", toggleRow);

            // Delete button
            const deleteCell = entryRow.insertCell(5);
            const deleteButton = document.createElement("img");
            deleteButton.src = "../images/delete.png"
            deleteButton.addEventListener("click", (e) => {
                const entryNumber = e.target.parentElement.parentElement.getAttribute("id").substring(6);
                const currentList = document.getElementsByClassName("selected-list")[0].getAttribute("id");
                
                // Call the chrome storage get, delete that entry, store it back, call displayEntries again
                chrome.storage.local.get(currentList).then((data) => {
                    let currentEntries = data[currentList];
                    currentEntries.splice(entryNumber, 1);
                    chrome.storage.local.set({[currentList]: currentEntries}).then(() => {displayEntries(currentList, sortmode, sortFunc);});
                });
            });
            deleteCell.appendChild(deleteButton);

            // Notes (hidden)
            const notesCell = entryRow.insertCell(6);
            const notes = document.createElement("p");
            notes.innerHTML = entries[i][4];
            notesCell.appendChild(notes);
            notesCell.classList.add("expanded-row-content");
            notesCell.classList.add("hide-row");
        }
    });
}

function displayList(listName) {

    const listTable = document.getElementById("list-table");

    const HEADERS = ["Title", "Author(s)", "Rating", "Entry Updated", "Entry Added"];

    const headerRow = listTable.insertRow(-1);

    // Remove the classes associated with sorting from the HTML elements that have them
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

    // Add listeners to change sort mode at the top of headers
    for (const header of HEADERS) {
        const headerElement = document.createElement("th");
        // Sortmodes: -1 is reverse, 1 is normal
        let sortmode;
        headerElement.addEventListener("click", function (e) {
            if (this.classList.contains("sort-ascending")) {
                this.classList.replace("sort-ascending", "sort-descending");
                sortmode = -1;
            }
            else {
                removeSortClasses();
                sortmode = 1;
                // There will definately be no other sort classes on at this point
                this.classList.add("sort-ascending");
            }

            displayEntries(document.getElementsByClassName("selected-list")[0].getAttribute("id"), sortmode, headerCompFns[this.innerHTML]);
        });
        headerElement.innerHTML = header;
        headerRow.appendChild(headerElement);
    }

    // Add deletion element
    const deleteHeader = document.createElement("th");
    deleteHeader.innerHTML = "Delete";
    headerRow.appendChild(deleteHeader);

    // Default sort is by last updated, normal mode
    headerRow.children.item(3).classList.add("sort-ascending");

    displayEntries(listName, 1, headerCompFns["Entry Updated"]);
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
