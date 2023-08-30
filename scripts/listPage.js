// First, add all of the lists that currently exist as buttons
// Then, load the first list's entries
// Change these entries when a different list button is pressed

const SCP_URL = "https://scp-wiki.wikidot.com/"

const toggleRow = (element) => {
    console.log(element);
  element.target.closest("tr").getElementsByClassName('expanded-row-content')[0].classList.toggle('hide-row');
  // console.log(event);
}

// For now, just work with the one list
chrome.storage.local.get("completed").then((data) => {
    // Entry format: [url, title, authors, rating, notes, enteredTime, updatedTime]
    let entries = "completed" in data ? data["completed"] : [];

    const listTable = document.getElementById("list-table");

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
        rating.innerHTML = entries[i][3].toString();
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