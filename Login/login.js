document.getElementById('loginButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

chrome.storage.session.set({
    isLoggedIn: true,
    username: "Adrian"

});



    try {
        const response = await fetch('https://jaguar.pl.mcd.com:5001/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            const emailJira = data.email;
            const tokenJira = data.tokenJira;

            // Save the token and login to session storage
            chrome.storage.session.set({ token, username, emailJira, tokenJira, isLoggedIn: true }, () => {
                window.location.href = '../Dashboard/dashboard.html';
            });

        } else {
            const result = await response.json();
            errorMessage.textContent = result.message || 'Nieprawidłowy login lub hasło.';
            if (response.status === 429) {
                disableButton(result.remainingMinutes);
            }
        }

    } catch (err) {
        console.error('Błąd podczas logowania:', err);
        errorMessage.textContent = 'Wystąpił błąd przy logowaniu.';
    }
});


function disableButton(min) {
    const button = document.getElementById('loginButton');
    button.disabled = true;

    setTimeout(() => {
         button.disabled = false;
    }, min * 60 * 1000);
}

