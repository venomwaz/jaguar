document.addEventListener('DOMContentLoaded', async () => {
  try {
        const result = await chrome.storage.session.get(['isLoggedIn', 'username']);
        
        if (!result.isLoggedIn) {
            window.location.href = '../Login/login.html';
            return;
        }
        
        const username = result.username || 'Nieznany';
        document.getElementById('userGreeting').textContent = username;

        document.getElementById('logoutButton').addEventListener('click', () => {
            chrome.storage.session.remove(['isLoggedIn', 'username', 'token', 'tokenJira', 'emailJira'], () => {
                window.location.href = '../Login/login.html';
            });
            chrome.storage.local.remove(['isLoggedIn', 'username','token'], () => {});
        });

        const response = await fetch(chrome.runtime.getURL('Libs/shortcuts.json'));

        chrome.storage.local.get('shortcutUsage', (data) => {
            const usageData = data.shortcutUsage || {};
            updateStats(usageData);
        });

    } catch (error) {
        console.error('Błąd podczas ładowania danych:', error);
        window.location.href = '../Login/login.html';
    }


  function updateStats(usageData) {
    let total = 0;
    let top = { shortcut: '', count: 0 };

    for (let [shortcut, count] of Object.entries(usageData)) {
      total += count;
      if (count > top.count) {
        top = { shortcut, count };
      }

      document.getElementById('totalCount').textContent = total;
      document.getElementById('topShortcut').textContent = top.shortcut || 'Brak';
    }

    drawChart(usageData);
  }

  function drawChart(usageData) {
  const labels = Object.keys(usageData);
  const counts = Object.values(usageData);

  const ctx = document.getElementById('shortcutChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Użycia skrótów',
        data: counts,
        backgroundColor: '#FFCC00',
        borderColor: '#FFCC00',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `Użycia: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Liczba użyć'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Skróty'
          }
        }
      }
    }
  });
}
});