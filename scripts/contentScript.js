chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === "authorRequest") {
            try {
                const licenseText = document.getElementsByClassName('licensebox')[0].getElementsByTagName('blockquote')[0].innerHTML;
                const authors = licenseText.substring(licenseText.indexOf("by ") + 3, licenseText.indexOf(", from")).split(', ');
                sendResponse({authorList: authors});
            } catch (e) {
                // If no author can be found, this is a hub page I think
                // Regardless, return no author
                sendResponse({authorList: [""]});
            }

        }
    }
);
