//DOMPurify access
if (typeof DOMPurify === "undefined") {
    console.error("DOMPurify is not loaded! Sprawdź manifest.json.");
} else {
    console.log("DOMPurify załadowane poprawnie.");
}




loadShortcuts().then((shortcuts) => {

    chrome.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {

            if (
                request.akcja === "kliknieto_skrot"
            ) {

                const target =
                    document.getElementById(
                        "ak-editor-textarea"
                    );

                if (!target) {
                    console.log(
                        "Nie znaleziono edytora Jira"
                    );

                    return;
                }
                target.focus();
                wykonajSkrot(
                    request.shortcut,
                    shortcuts,
                    target
                );

                sendResponse({
                    success: true
                });
            }

            return true;
        }
    );

});



// shortcuts loader
async function loadShortcuts() {
    const response = await fetch(chrome.runtime.getURL("Libs/shortcuts.json"));
    const data = await response.json();
    return data.snippets.reduce((acc, snippet) => {
        acc[snippet.shortcut] = {
            html: snippet.html,
            argumenty: snippet.argumenty ?? 0,
            title: snippet.title,
            payload: snippet.payload
        };
        return acc;
    }, {});
}


async function loadSciezki() {
    const response = await fetch(chrome.runtime.getURL("Libs/sciezki.json"));
    const data = await response.json();
    return data.snippets.reduce((acc, snippet) => {
        acc[snippet.shortcut] = {
            tytul: snippet.html,
            yes: snippet.yes,
            no: snippet.no,
        };
        return acc;
    }, {});
}




async function loadLiderShortcuts() {
    const response = await fetch('https://jaguar.pl.mcd.com:5001/lidershortcut/recent');
    const data = await response.json();
    
    return data.reduce((acc, item) => {
        acc[item.shortcutName] = {
            title: item.title,
            description: item.description,
            timestamp: item.timestamp,
            id: item.id
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
        ) {wpisywanie_skrotu(target, shortcuts);
            console.log(target)
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")

        }
    });
});



function wykonajSkrot(shortcut, shortcuts, target) {
      let tablica_argumentow = []

    console.log(tablica_argumentow)
    recordShortcutUsage(shortcut);
    let do_wypelnienia = Number(shortcuts[shortcut].argumenty)

    if(do_wypelnienia > 0){
        for(let i = 0; i<do_wypelnienia;i++){
            let pole = prompt("Pole", i)
            tablica_argumentow.push(pole)
        }
    }

    console.log(tablica_argumentow)
    let kopia_skrotu = shortcuts[shortcut]

    for(let i = 0; i < tablica_argumentow.length; i++){
        console.log(tablica_argumentow[i])
        if(i = 0){
        kopia_skrotu.title = (kopia_skrotu.html).replaceAll("@0",tablica_argumentow[i]);
        continue;
        }
        kopia_skrotu.html = (kopia_skrotu.html).replaceAll("@"+i,tablica_argumentow[i])
    }

    const sanitized = DOMPurify.sanitize(
        kopia_skrotu.html
    );
    // console.log("*****************************")
    // console.log(shortcuts[shortcut])
    // console.log(shortcuts[shortcut].argumenty)
    // console.log(shortcut)
    // console.log(shortcuts)

    // console.log(sanitized)
    // console.log("*****************************")


    if (typeof target.value !== "undefined") {
        target.value += sanitized;
    } else {
        target.innerHTML = sanitized;
    }

    const url = window.location.href;
    let match = url.match(
        /(?:\/|^)([A-Z][A-Z0-9]+-\d+)(?=$|[\/?#])/i
    );

    chrome.runtime.sendMessage({
        type: "IssueChange",
        payload: kopia_skrotu.payload,
        nr: match?.[1]
    });
}



loadLiderShortcuts().then((shortcuts) => {
    document.addEventListener("input", (event) => {
        const target = event.target;

        // jira
        if (
            target.tagName === "TEXTAREA" ||
            (target.tagName === "INPUT" && target.type === "text") ||
            target.classList.contains("jira-wikifield") ||
            target.classList.contains("ProseMirror")
        ) {wpisywanie_skrotu(target, shortcuts);
                    console.log(target)
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")

        }
    });
});

function wpisywanie_skrotu(target, shortcuts) {
            const text = target.value || target.innerText;

            chrome.runtime.sendMessage({ type: "checkSession" }, (response) => {
                if (response.isLoggedIn) {
                    Object.keys(shortcuts).forEach((shortcut) => {
                if (text.endsWith(shortcut)) {
                    target.focus();
                    wykonajSkrot(
                        shortcut,
                        shortcuts,
                        target
                    );

                }
                    });
                }
            });
}

