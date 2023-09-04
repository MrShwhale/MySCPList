function addButtonListeners() {
    document.getElementById("clear-list").addEventListener("click", function() {
        chrome.storage.local.clear();
    });

    document.getElementById("download-list").addEventListener("click", function() {
        chrome.storage.local.get(null, function(items) { 
            // Convert object to a string.
            var result = JSON.stringify(items);

            // Save as file
            try {
                var url = 'data:application/json;unicode,' + result;
                chrome.downloads.download({
                    url: url,
                    filename: 'MySCPList.json'
                });
                alert("Successfully downloaded list");
            }
            catch (e) {
                console.log(e);
                alert("Error downloading lists");
            }
        });
    });

    document.getElementById("restore-list").addEventListener("click", function() {
        const fileInput = document.getElementById("restore-list-file");
        
        // Validate that the file is a JSON

        const reader = new FileReader();

        reader.onload = function() {
            let loaded = undefined;
            try {
                loaded = JSON.parse(reader.result);
            }
            catch (e) {
                console.log(e);
                alert("Error parsing JSON file");
                return;
            }

            try {
                // Take the loaded JSON, and put it directly into storage
                chrome.storage.local.set(loaded);
                alert("Lists restored!");
            }
            catch (e) {
                console.log(e);
                alert("Error storing JSON data");
            }
        };

        reader.onerror = function() {
            alert("Error reading file.");
            console.log(reader.error);
        };

        const file = fileInput.files[0];
        if (file) {
            if (file.type == "application/json") {
                reader.readAsText(file);
            }
            else {
                alert("You must pick a .json file to restore from");
            }
        }
        else {
            alert("Please select a file to restore from");
        }
    });

}

addButtonListeners();
