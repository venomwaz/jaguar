document.addEventListener('DOMContentLoaded', async () => {
    // Actively check for login changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'session' && changes.isLoggedIn) {
            const isLoggedIn = changes.isLoggedIn.newValue;

            if (isLoggedIn === true) {
                window.location.href = '#';
            }

            if (!isLoggedIn) {
                window.location.href = '../../LoginSidepanel/login.html';
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

        fetch(chrome.runtime.getURL('Libs/descriptionKVS.json'))
            .then(response => response.json())
            .then(data => {

                data.snippets.forEach(snippet => {
                    addShortcutToList(snippet.name, snippet.text, snippet.shortcut, snippet.category, snippet.ip);
                });

                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    const items = shortcutsList.getElementsByTagName('li');
                    const special = specialList.getElementsByTagName('li');
                    Array.from(items).forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(query) ? '' : 'none';
                    });
                    Array.from(special).forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(query) ? '' : 'none';
                    });
                });
            });

        function addShortcutToList(name, text, shortcut, category) {
            const li = document.createElement('li');
            shortcut = DOMPurify.sanitize(shortcut);
            name = DOMPurify.sanitize(name);
            text = DOMPurify.sanitize(text);
            category = DOMPurify.sanitize(category);
            li.innerHTML = `<b><span style=\"font-size: 15px;\">${shortcut} AAAAA</span></b> <span style=\"margin:0 5px 0 5px;font-size:20px;\">&#8658;</span> ${name}<span style=\"visibility:hidden;\">${category}</span>`;
            li.title = text;
            if(category.trim().toLowerCase() === "427"){
                specialList.appendChild(li);
            } else {
                shortcutsList.appendChild(li);
            }
            
        }
});
