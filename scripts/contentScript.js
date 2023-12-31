chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === "authorRequest") {
            try {
                // Feature idea: if the licensebox has been found, then return the authors credited in it
                // TODO licenseboxes are leading to things getting a little too complicated. Too many formats, and it is breaking. Fix later.
                readHistory().then((authorList) => {sendResponse(authorList)});

            } catch (e) {
                // If no author can be found return as such
                console.log(e.message);
                sendResponse({authorList: Array("Unknown author")});
            }

            return true;
        }
    }
);

async function readHistory() {
    // Request history, then find the first person who edited and return them
    // Get pageId from the WIKIREQUEST part of the page
    const pageId = parseInt(/WIKIREQUEST\.info\.pageId = (\d+);/g.exec(document.getElementsByTagName("html")[0].innerHTML)[1]);

    // Request data:
    // page: 1
    // perpage: <very large number>
    // moduleName: history/PageRevisionListModule
    // pageId: <pageId>
    // page_id: <pageId>
    // wikidot_token7: <taken from page>
    // Adapted from actual HTTP request made by the wiki

    const wikidot_token7 = document.cookie.substring(document.cookie.indexOf("=")+1);
    const author = fetch("https://scp-wiki.wikidot.com/ajax-module-connector.php", {
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
    "body": "page=1&perpage=1000000&page_id=" + pageId
        + "&options=%7B%22all%22%3Atrue%7D&moduleName=history%2FPageRevisionListModule&callbackIndex=2&wikidot_token7=" + wikidot_token7,
    "method": "POST"
    }).then((result) => result.json()).then(
    (data) => {
        // Find the last index of "WIKIDOT.page.listeners.userInfo"
        // Starting there, take the substring from the first > to the first <
        console.log(data);
        data = data["body"];
        const lastEntryIndex = data.lastIndexOf("WIKIDOT.page.listeners.userInfo");
        return data.substring(data.indexOf(">", lastEntryIndex) + 1, data.indexOf("<", lastEntryIndex));
    });
    return {authorList: Array(author)};
}
