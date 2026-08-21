//DOMPurify access
if (typeof DOMPurify === "undefined") {
    console.error("DOMPurify is not loaded! Sprawdź manifest.json.");
} else {
    console.log("DOMPurify załadowane poprawnie.");
}


chrome.storage.session.set({
    isLoggedIn: true

});

// shortcuts loader
async function loadShortcuts() {
    const response = await fetch(chrome.runtime.getURL("Libs/shortcuts.json"));
    const data = await response.json();
    return data.snippets.reduce((acc, snippet) => {
        acc[snippet.shortcut] = {
            html: snippet.html,
            title: snippet.title,
            payload: snippet.payload
        };
        return acc;
    }, {});
}

// Shorcut record usage
async function recordShortcutUsage(shortcut) {
    chrome.storage.local.get('shortcutUsage', (data) => {
        let usage = data.shortcutUsage || {};
        usage[shortcut] = (usage[shortcut] || 0) + 1;
        chrome.storage.local.set({ shortcutUsage: usage });
    });

    let match;
    try{
        const url = window.location.href;
        match = url.match(/(?:\/|^)([A-Z][A-Z0-9]+-\d+)(?=$|[\/?#])/i);
    } catch (err) {
        console.error("Błąd przy analizie URL", err);
    }
    

    const logMessage = {
        level: match[1],
        message: shortcut,
        context: {
            shortcutName: shortcut,
        },
        timestamp: new Date().toISOString(),
    };
    chrome.runtime.sendMessage({ type: "LogSaver", log: logMessage });
}

// main
loadShortcuts().then((shortcuts) => {
    document.addEventListener("input", (event) => {
        const target = event.target;

        // jira
        if (
            target.tagName === "TEXTAREA" ||
            (target.tagName === "INPUT" && target.type === "text") ||
            target.classList.contains("jira-wikifield") ||
            target.classList.contains("ProseMirror")
        ) {
            const text = target.value || target.innerText;

            chrome.runtime.sendMessage({ type: "checkSession" }, (response) => {
                if (response.isLoggedIn) {
                    Object.keys(shortcuts).forEach((shortcut) => {
                        if (text.endsWith(shortcut)) {
                            recordShortcutUsage(shortcut);

                            const sanitized = DOMPurify.sanitize(shortcuts[shortcut].html);

                            if (typeof target.value !== "undefined") {
                                target.value = text.replace(shortcut, sanitized);
                            } else {
                                target.innerHTML = text.replace(shortcut, sanitized);
                            }
                            const url = window.location.href;
                            let match = url.match(/(?:\/|^)([A-Z][A-Z0-9]+-\d+)(?=$|[\/?#])/i);
                            //console.log(shortcuts[shortcut].payload);
                            chrome.runtime.sendMessage({ type: "TitleChange", payload: shortcuts[shortcut].payload, nr:match[1]});
                        }
                    });
                }
            });
        }
    });
});
