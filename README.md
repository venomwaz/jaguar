# Jaguar - Havi Text Expander

Jaguar to aplikacja, która automatycznie przekształca skróty tekstowe na ich pełne, rozwinięte formy, uzupełniając w ten sposób  Narzędzie to zostało stworzone z myślą o użytkownikach, którzy pracują z dokumentami technicznymi, akademickimi, medycznymi, prawnymi lub dowolnym tekstem zawierającym specjalistyczne skróty.

## Jak to działa?

Użytkownik wprowadza tekst zawierający skróty, a Jaguar automatycznie analizuje kontekst i zamienia skróty na pełne formuły. Może to działać w czasie rzeczywistym lub jako etap końcowy przed zapisaniem dokumentu. Aplikacja opiera się na bazie danych zawierającej tysiące skrótów oraz na algorytmach uczenia maszynowego, które pozwalają rozpoznać nowe lub rzadziej spotykane skróty w kontekście zdania.

## Raportowanie

Po każdym rozwinięciu skrótu, dane są przesyłane na serwer backendowy, gdzie:
- Trafiają jako JSON przez POST /api/logs
- Zapisywane są w bazie PostgreSQL
- Dodatkowo odkładane są jako wpisy w dziennych plikach tekstowych (logs/YYYY-MM-DD.log)
- Dane zawierają tylko anonimowe informacje (skrót, rozwinięcie, timestamp, użytkonik)

## Przykładowa zawartość pliku JSON

 ```json nowy
 "snippets": [
    {
     "name": "TEST ",
     "shortcut": "--test",
     "text": "Testowa informacja",
     "html": "<p style=\"color: #FF5630;\">test</p> </br>"
    }
]
 ```

## Przykład

- Skrót: `--ty`
- Pełna formuła: `Thank you`

## Funkcje

- Wyszukiwanie skrótów
- Wyświetlanie pełnych formuł na podstawie skrótu
- Dynamiczne ładowanie danych z pliku JSON
- Wysyłanie danych telemetrycznych na serwer backendowy https://jaguar.pl.mcd.com

---

## Struktura projektu
```
Jaguar/
├── manifest.json           # Konfiguracja rozszerzenia
├── background.js           # Skrypt tła (np. zarządzanie cache, komunikacja z API)
├── content.js              # Skrypt wstrzykiwany do stron – rozwija skróty
├── Dashboard/
│ ├── dashboard.html        # UI po kliknięciu ikonki
│ ├── dashboard.js          # Logika dashboardu
│ └── styles.css            # Style dashboardu
├── images/                 # Grafiki i ikony
├── Login/
│ ├── login.html            # UI okna logowania
│ ├── login.js              # Logika logowania
│ └── loginStyle.css        # Style okna logowania
├── Libs/
│ ├── purify.min.js         # Biblioteka DOMPurify
| ├── helpful.json          # Definicje skrótów dla zakładki pomocne
│ └── shortcuts.json        # Definicje skrótów i ich tytułów oraz rozszerzeń
├── LoginSidepanel/
| ├── sidepanel.html        # UI panelu bocznego
| ├── sidepanel.js          # Logika panelu bocznego
| ├── sidepanel.css         # Style panelu bocznego
│ └── Pomocne/
|    ├── helpful.html       # UI zakładki pomocne
|    ├── helpful.js         # Logika zakładki pomocne
│    └── helpful.css        # Style zakładki pomocne
└── README.md

```


---

## 🚀 Instalacja (Chrome - Tryb Deweloperski)

1. Otwórz przeglądarkę **Google Chrome** i przejdź do rozszerzenia
2. Włącz **Tryb deweloperski** (w prawym górnym rogu).
3. Kliknij **"Załaduj rozpakowany"**.
4. Wskaż folder, w którym znajduje się aplikacja Jaguar (z plikiem `manifest.json`).
5. Rozszerzenie zostanie dodane do Chrome i będzie gotowe do użycia.
6. Jeżeli pojawi się błąd, załaduj 

---

## 🔐 Logowanie

1. Kliknij ikonę rozszerzenia Jaguar.
2. Wprowadź swój **adres e-mail** w formularzu logowania.
3. Po kliknięciu "Zaloguj" zostaniesz przeniesiony do głównego widoku aplikacji.
4. **Hasło podane jest w KeePass** Uwierzytelnianie odbywa się po stronie API, zwracany jest tylko token JWT, dzięki któremu aplikacja wie jaki użytkownik korzysta. (Działa na zasadzie sesji).

---
 ```
🙋‍♂️ Autorzy
    Patryk Lasek
    Artur Cholewski
```
---

## Change log
### V 2.1.2
- Po pierwsze Jaguar połączył się z Asistą! – nie tylko zmienia opis zgłoszenia, lecz także:
    - jego typ (incydent, usługa itd.),
    - typ żądania w zależności od użytego skrótu,
    - tytuł dopasowany do szablonu powtarzającego się zgłoszenia.
- Nowe szablony dopasowane do obecnych problemów, ustalone wraz z mentorami SD.
- Opisy KVS’ów w restauracji oraz wyszczególnienie dla restauracji 427.
- Niektóre zgłoszenia nie posiadają tylko jednego rozwiązania, lecz tytuły są ustandaryzowane, co za tym idzie podział taki także zawitał w Jaguarze.
- Dodaliśmy także możliwość otworzenia całkowicie osobnego okna, w którym będzie działała aplikacja, dzięki czemu będzie podgląd na skróty, 
a okno przeglądarki nie będzie pomniejszane o „Panel boczny”.
- Dashboard także uległ zmianie, teraz dużo łatwiej każdy będzie w stanie zobaczyć swoje użycia
---# jaguar
