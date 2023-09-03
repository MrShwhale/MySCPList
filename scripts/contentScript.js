chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === "authorRequest") {
            try {
                const licenseBox = document.getElementsByClassName('licensebox')[0]
                // If the licensebox has been found, then return the authors credited in it
                if (licenseBox) {
                    const licenseText = licenseBox.getElementsByTagName('blockquote')[0].innerHTML;
                    let authors = licenseText.substring(licenseText.indexOf("by ") + 3, licenseText.indexOf(", from")).split(', ');
                    
                    // Handle having just 2 authors (split on " and ")
                    if (authors.length == 1) {
                        const andIndex = authors[0].lastIndexOf(" and ");
                        if (andIndex != -1) {
                            authors = [authors[0].substring(0, andIndex), authors[0].substring(andIndex)]
                        }
                    }
                    console.log("MySCPList: licenseBox found");
                    sendResponse({authorList: authors});
                }
                else {
                    // Check the history of the page for the first author
                    // This is a LOT harder than I thought, wait on it
                }

            } catch (e) {
                // If no author can be found, this is a hub page I think
                // Regardless, return no author
                sendResponse({authorList: ["No author found"]});
            }

        }
    }
);
