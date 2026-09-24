let skrot_index = 0
let odd_number = 1
let wyswietlanie_guzikow = true
let last_type = null
let placeholderContainer = null;
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("skrot_button")) {
        console.log("Kliknięto", e.target.id);
        zwroc_skroty()

        chrome.runtime.sendMessage(
            {
                type: "GetLastJiraTab"
            },
            async (response) => {

                const tabId =
                    response?.tabId;

                if (!tabId) {

                    console.error(
                        "Nie znaleziono aktywnej karty Jira"
                    );

                    return;
                }

                let skroty =
                    await zwroc_skroty();

                chrome.tabs.sendMessage(
                    tabId,
                    {
                        akcja: "kliknieto_skrot",
                        shortcut:
                            skroty[e.target.id]
                    },
                    (response) => {

                        if (
                            chrome.runtime.lastError
                        ) {

                            console.error(
                                chrome.runtime.lastError
                            );

                        }

                        console.log(response);

                    }
                );

            }
        );
    }
});




function removeShortcuts() {
    shortcutsList.innerHTML = "";
    specialList.innerHTML = "";

    skrot_index = 1;
    odd_number = 1;
    last_type = null;
    placeholderContainer = null;
}

async function zwroc_skroty() {
    const response = await fetch(chrome.runtime.getURL("Libs/shortcuts.json"));
    const data = await response.json();

    return data.snippets.map(snippet => snippet.shortcut);
}


document.addEventListener('DOMContentLoaded', async () => {

document.querySelector(".menu_kategorii").addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    removeShortcuts()
    console.log("Kliknięto:", e.target.name);
    try_to_add_shortcuts(e.target.name)

});


    const storedValue =
        localStorage.getItem("czy_guziki");

    wyswietlanie_guzikow =
        storedValue === null
            ? true
            : storedValue === "true";

    const checkbox =
        document.getElementById("czy_guziki");

    if (checkbox) {
        checkbox.checked =
            wyswietlanie_guzikow;
    }

    // Actively check for login changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'session' && changes.isLoggedIn) {
            const isLoggedIn = changes.isLoggedIn.newValue;

            if (isLoggedIn == true) {
                window.location.href =
                    '../Sidepanel/sidepanel.html';
            }

            if (!isLoggedIn) {
                window.location.href =
                    '../LoginSidepanel/login.html';
            }
        }
    });

    chrome.storage.session.get(['username'], (data) => {
        const username =
            data.username || 'Nieznany użytkownik';

        document.getElementById('userGreeting')
            .textContent = username;
    });




    try_to_add_shortcuts()

    async function try_to_add_shortcuts(wymuszony_typ = null){
    if (wymuszony_typ == "wszystko") wymuszony_typ = null
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
                    addShortcutToList(snippet.name, snippet.shortcut, snippet.text, snippet.category, snippet.type);
                });

                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    const items = shortcutsList.getElementsByTagName('li');
                    Array.from(items).forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(query) ? '' : 'none';
                    });
                    ukryj_puste_kategorie();
                });
            });

        async function addShortcutToList(name, shortcut, text, category, type ) {
            if (skrot_index == 0) {
                skrot_index = 1;
                return
            }
            if(!type)type="kvs"
        if( wymuszony_typ !=null && type != wymuszony_typ) return
       if (last_type !== type || last_type == null) {
                   let container = document.getElementsByClassName(type)
                   if(container.length == 0){

    placeholderContainer = document.createElement("div");
    placeholderContainer.classList.add("category", type);

    const title = document.createElement("h1");
    if(title.textContent != null)
    title.textContent = (type).toUpperCase();
    title.classList.add("category-header");

    placeholderContainer.appendChild(title);
    shortcutsList.appendChild(placeholderContainer);

    last_type = type;}
}
            const li = document.createElement('li');
             li.classList.add("skrot_button");

            
            li.id =skrot_index;
            name = DOMPurify.sanitize(name);
            shortcut = DOMPurify.sanitize(shortcut);
            category = DOMPurify.sanitize(category);
            if (odd_number % 2 == 0) {
                li.classList.add("odd")
                odd_number = 0
            }
            odd_number++
            if (wyswietlanie_guzikow == null) wyswietlanie_guzikow = true
            if (wyswietlanie_guzikow)
                li.innerHTML = `<b><span style=\"font-size: 15px;\">${skrot_index}.  ${shortcut} </span></b> <br><br><span style=\"margin:0 5px 0 5px;\">&#8644;</span> ${name}
            `;

            // <button id = "${skrot_index}" class ="skrot_button ${skrot_index}">WKLEJ ${skrot_index}</button>

            else
                li.innerHTML = `<b><span style=\"font-size: 15px;\"> </span></b>${name}`;

            li.title = text;
            skrot_index++;
            
            let container = document.getElementsByClassName(type)
            if(container[0])
            container[0].appendChild(li);

            last_type = type
        }
        try {
            const response = await fetch('https://jaguar.pl.mcd.com:5001/lidershortcut/recent');
            if (response.ok) {
                const shortcuts = await response.json();
                const container = document.getElementById('liderShortcutsList');

                if (shortcuts.length === 0) {
                    container.innerHTML = '<p style="color: #999;">Brak masówek</p>';
                    return;
                }

                container.innerHTML = shortcuts.map(shortcut =>
                    `<li title=\"${shortcut.description}\"><b><span style=\"font-size: 15px;\">${shortcut.shortcutName} </span></b> <span style=\"margin:0 5px 0 5px;\">&#8644;</span> ${shortcut.title} </li>`
                ).join('');
            }
        } catch (error) {
            console.error('Błąd podczas ładowania masówek:', error);
        }
    } catch (error) {
        console.error('Błąd podczas ładowania danych:', error);
        window.location.href = '../LoginSidepanel/login.html';
    }
}

    document.getElementById('refresh')?.addEventListener('click', (event) => {
        event.preventDefault();

        const checkbox = document.getElementById("czy_guziki");
        localStorage.setItem("czy_guziki", checkbox.checked);

        window.location.reload();
    });


    document.getElementById('detachWindowBtn')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: "openDetachedWindow" });
    });
});


    document.getElementById('debug')?.addEventListener('click', (event) => {
        console.log("debug================================")
ukryj_puste_kategorie();


});



        function ukryj_puste_kategorie(){
                let listy = document.getElementsByClassName("category")
                // console.log("-------------------------------")
                // console.log(listy)
                // console.log("-------------------------------")

                for (let j = 0; j < listy.length; j++){
                    let lista = listy[j]
                console.log(lista)

                    let elementy_listy = lista.getElementsByTagName('li');

                                    // console.log("==========",j,"==============")
                console.log(elementy_listy)
                                    // console.log("========================")
                                    let licznik_wystapien = 0
                    for(let element of elementy_listy){
                        console.log(element.style.display)
                        if (element.style.display=='')
                            licznik_wystapien++;
                    }
                    // console.log(licznik_wystapien + "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^" + j)
                    if(licznik_wystapien > 0)lista.style.display='';
                    else lista.style.display='none'
    }
  }