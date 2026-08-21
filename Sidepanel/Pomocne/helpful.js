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

    const list = document.getElementById('shortcutsList');
    const search = document.getElementById('search');

    chrome.storage.session.get(['username'], (data) => {
        const username = data.username || 'Nieznany użytkownik';
        document.getElementById('userGreeting').textContent = username;
    });

    const searchInput = document.getElementById('search');
        const shortcutsList = document.getElementById('shortcutsList');

        fetch(chrome.runtime.getURL('Libs/helpful.json'))
            .then(response => response.json())
            .then(data => {

                data.snippets.forEach(snippet => {
                    addShortcutToList(snippet.name, snippet.text);
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

        function addShortcutToList(name, text) {
            const li = document.createElement('li');
            name = DOMPurify.sanitize(name);
            text = DOMPurify.sanitize(text);
            li.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center;"><div>${name}</div><button class="copy-btn" data-text="${text}" title="Kopiuj do schowka"><i class="fa fa-copy"></i></button></div>`;
            li.title = text;
            shortcutsList.appendChild(li);
        }
        
        document.addEventListener('click', function (e) {
        if (e.target.closest('.copy-btn')) {
            const button = e.target.closest('.copy-btn');
            const textToCopy = button.getAttribute('data-text');
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerHTML = '<i class="fa fa-check"></i>'; // change icon
                setTimeout(() => {
                    button.innerHTML = '<i class="fa fa-copy"></i>'; // re-change icon
                }, 1500);
            }).catch(err => {
                console.error('Błąd kopiowania:', err);
            });
        }
    });
});
