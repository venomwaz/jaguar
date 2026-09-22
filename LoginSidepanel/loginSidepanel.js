document.addEventListener('DOMContentLoaded', () => {
    // Check current login state
    chrome.storage.session.get('isLoggedIn', (result) => {
        const isLoggedIn = result?.isLoggedIn || false;
        const currentPath = window.location.pathname;

        if (!isLoggedIn && !currentPath.includes('login.html')) {
            window.location.href = 'login.html';
        } else if (isLoggedIn && !currentPath.includes('Sidepanel.html')) {
            window.location.href = '../Sidepanel/Sidepanel.html';
        }
    });

    // Actively check for login changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'session' && changes.isLoggedIn) {
            if (changes.isLoggedIn.newValue == true) {
                window.location.href = '../Sidepanel/sidepanel.html';
            }
        }
    });
});
