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
                    console.log("reading history");
                    readHistory().then(sendResponse);
                }

            } catch (e) {
                // If no author can be found return as such
                console.log(e.message);
                sendResponse({authorList: Array("No author found")});
            }

            return true;
        }
    }
);
async function readHistory() {
    // Request history, then find the first person who edited and return them
    // Get pageId from the WIKIREQUEST part of the page
    // The cookie token and the payload token are different. This may cause issues.
    let author = undefined;
    console.log("Searching history");
    const pageId = parseInt(/WIKIREQUEST\.info\.pageId = (\d+);/g.exec(document.getElementsByTagName("html")[0].innerHTML)[1]);
    const data = {
    "page": 1,
    "perpage": 1000000,
    "moduleName": "history/PageRevisionListModule",
    "pageId": pageId,
    "page_id": pageId,
    "wikidot_token7": "ayylmao"
    };
    // Adapted from actual HTTP request made
    const response = await fetch("https://scp-wiki.wikidot.com/ajax-module-connector.php", {
    "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "cookie": document.cookie,
    "Referer": window.location.href,
    "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "page=1&perpage=1000000&page_id=" + pageId + "&options=%7B%22all%22%3Atrue%7D&moduleName=history%2FPageRevisionListModule&callbackIndex=2&wikidot_token7=ayylmao",
    "method": "POST"
    }).then(result => result.json()).then(
    (data) => {
        // Find the last index of "WIKIDOT.page.listeners.userInfo"
        // Starting there, take the substring from the first > to the first <
        data = data["body"];
        const lastEntryIndex = data.lastIndexOf("WIKIDOT.page.listeners.userInfo");
        author = data.substring(data.indexOf(">", lastEntryIndex) + 1, data.indexOf("<", lastEntryIndex));
    });
    return {authorList: Array(author)};
}
