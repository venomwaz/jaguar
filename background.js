// Sidepanel Window
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openSidePanelWindow",
        title: "Otwórz panel w osobnym oknie",
        contexts: ["action"]
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "openSidePanelWindow") {
        chrome.storage.session.get(['isLoggedIn'], (data) => {
            if (data.isLoggedIn) {
                chrome.windows.create({
                    url: chrome.runtime.getURL("Sidepanel/sidepanel.html"),
                    type: "popup",
                    width: 400,
                    height: 700
                });
            }
        });
    }
});
    

// Session and local memory clear after restart
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.session.remove(['isLoggedIn', 'username', 'token', 'tokenJira', 'emailJira']);
    chrome.storage.local.remove(['isLoggedIn', 'username', 'token', 'tokenJira', 'emailJira']);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "checkSession") {
        chrome.storage.session.get(['isLoggedIn'], (data) => {
            sendResponse({ isLoggedIn: data.isLoggedIn || false});
        });
        return true; // <- important, async answear
    }

    if (message.type === "LogSaver") {
        const logMessage = message.log;
        // get chrome.storage.session
        chrome.storage.session.get(["token"]).then((result) => {
            const token = result.token;

            if (!token) {
                sendResponse({ success: false, message: "Brak tokena" });
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            fetch("https://jaguar.pl.mcd.com:5001/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(logMessage),
                signal: controller.signal,
            })
                .then((response) => response.json())
                .then((data) => {
                    clearTimeout(timeoutId);
                    sendResponse({ success: true, data });
                })
                .catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
        });
        return true;
    }

    if (message.type === "TitleChange") {
        //let payload = message.payload;
        const nr = message.nr;
        // get chrome.storage.session
        chrome.storage.session.get(["token"]).then((result) => {
            const token = result.token;

            if (!token) {
                sendResponse({ success: false, message: "Brak tokena" });
                return;
            }

            chrome.storage.session.get(['tokenJira', 'emailJira'], (data) => {
                const tokenJira = data.tokenJira;
                const emailJira = data.emailJira;

                const auth = btoa(`${emailJira}:${tokenJira}`);

                fetch(`https://mcdonalds-poland.atlassian.net/rest/api/3/issue/${nr}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(message.payload)
            })
                .then(async res => {
                    const body = await res.text();
                    if (!res.ok) throw new Error(body);
                })
                .catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
            });
            
        });
        return true;
    }
});