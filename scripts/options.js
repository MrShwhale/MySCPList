function addButtonListeners() {
    // TODO add feedback/notifications to each of these actions
    
    document.getElementById("clear-list").addEventListener("click", function() {
        chrome.storage.local.clear();
    });

    document.getElementById("download-list").addEventListener("click", function() {
        chrome.storage.local.get(null, function(items) { 
            // Convert object to a string.
            var result = JSON.stringify(items);

            // Save as file
            var url = 'data:application/json;base64,' + btoa(result);
            chrome.downloads.download({
                url: url,
                filename: 'MySCPList.json'
            });
        });
    });

    document.getElementById("restore-list").addEventListener("click", function() {
        // Get the value of the file the user picked
        // Validate it
        // Try to load it
        // Inform the users of the result
        
        // Take the loaded JSON, and just put it into storage
        chrome.storage.set(loaded);
    });

}

addButtonListeners();
