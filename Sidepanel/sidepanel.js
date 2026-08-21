document.addEventListener('DOMContentLoaded', async () => {
    // Actively check for login changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'session' && changes.isLoggedIn) {
            const isLoggedIn = changes.isLoggedIn.newValue;

            if (isLoggedIn == true) {
                window.location.href = '../Sidepanel/sidepanel.html';
            }

            if (!isLoggedIn) {
                window.location.href = '../LoginSidepanel/login.html';
            }
        }
    });

    chrome.storage.session.get(['username'], (data) => {
        const username = data.username || 'Nieznany użytkownik';
        document.getElementById('userGreeting').textContent = username;
    });

    const searchInput = document.getElementById('search');
    const shortcutsList = document.getElementById('shortcutsList');
    const specialList = document.getElementById('specialList');

    try{
        fetch(chrome.runtime.getURL('Libs/shortcuts.json'))
            .then(response => response.json())
            .then(data => {

                data.snippets.forEach(snippet => {
                    addShortcutToList(snippet.name, snippet.shortcut, snippet.text, snippet.category);
                });

                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    const items = shortcutsList.getElementsByTagName('li');
                    Array.from(items).forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(query) ? '' : 'none';
                    });
                });
            });

        function addShortcutToList(name, shortcut, text, category) {
            const li = document.createElement('li');
            name = DOMPurify.sanitize(name);
            shortcut = DOMPurify.sanitize(shortcut);
            category = DOMPurify.sanitize(category);
            li.innerHTML = `<b><span style=\"font-size: 15px;\">${shortcut} </span></b> <span style=\"margin:0 5px 0 5px;\">&#8644;</span> ${name}`;
            li.title = text;
            if(category.trim().toLowerCase() === "tytul"){
                specialList.appendChild(li);
            } else {
                shortcutsList.appendChild(li);
            }
        }
    } catch(error) {
        console.error('Błąd podczas ładowania danych:', error);
        window.location.href = '../LoginSidepanel/login.html';
    }

    document.getElementById('detachWindowBtn')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: "openDetachedWindow" });
    });
});
