var confirmElement = document.querySelector(".confirm");

function closePage(){
  clearClassList();
}

function openPage(page){
  clearClassList();
  var classList = confirmElement.classList;
  classList.add("page_open");
  classList.add("page_" + page + "_open");
}

function clearClassList(){
  var classList = confirmElement.classList;
  classList.remove("page_open");
  classList.remove("page_1_open");
  classList.remove("page_2_open");
  classList.remove("page_3_open");
}

var time = document.getElementById("time");
var options = { year: 'numeric', month: 'numeric', day: '2-digit' };
var optionsTime = { second: 'numeric', minute: 'numeric', hour: '2-digit' };

// ZABEZPIECZENIE: Inicjalizuj zegar tylko jeśli element time istnieje
if (time) {
    if (localStorage.getItem("update") == null){
      localStorage.setItem("update", "21.05.2025")
    }

    var date = new Date();

    var updateText = document.querySelector(".bottom_update_value");
    if (updateText) {
        updateText.innerHTML = localStorage.getItem("update");
    }

    var update = document.querySelector(".update");
    if (update) {
        update.addEventListener('click', () => {
          var newDate = date.toLocaleDateString("pl-PL", options);
          localStorage.setItem("update", newDate);
          if (updateText) {
              updateText.innerHTML = newDate;
          }
          scroll(0, 0)
        });
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    setClock();
    function setClock(){
        date = new Date();
        time.innerHTML = "Czas: " + date.toLocaleTimeString("pl-PL", optionsTime) + " " + date.toLocaleDateString("pl-PL", options);    
        delay(1000).then(() => {
            setClock();
        })
    }
}

var unfold = document.querySelector(".info_holder");
if (unfold) {
    unfold.addEventListener('click', () => {
      if (unfold.classList.contains("unfolded")){
        unfold.classList.remove("unfolded");
      }else{
        unfold.classList.add("unfolded");
      }
    });
}

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') || localStorage.getItem("user_token");

// GŁÓWNA FUNKCJA: Wrzuca pobrane dane do interfejsu
// GŁÓWNA FUNKCJA: Wrzuca pobrane dane do interfejsu
function wypelnijWszystkieDane(data) {
    
    // 1. Ustawianie zdjęcia jako tło w diva
    var idOwnImage = document.querySelector(".id_own_image");
    if (idOwnImage && data.zdjecie) {
        idOwnImage.style.backgroundImage = `url(${data.zdjecie})`;
    }

    // 2. Przetwarzanie i wstawianie tekstu niezależnie od siebie
    if (window.location.pathname.includes('card.html') || !window.location.pathname.includes('moreid.html')) {
        
        // Bezpieczne wstawianie danych tekstowych (niezależne od warunku daty urodzenia)
        setData("name", (data['name'] || data['imie'] || "").toUpperCase());
        setData("surname", (data['surname'] || data['nazwisko'] || "").toUpperCase());
        setData("nationality", (data['nationality'] || "POLSKIE").toUpperCase());
        setData("familyName", data['familyName'] || "");
        setData("fathersFamilyName", data['fathersFamilyName'] || "");
        setData("mothersFamilyName", data['mothersFamilyName'] || "");
        setData("birthPlace", data['birthPlace'] || "");
        setData("countryOfBirth", data['countryOfBirth'] || "");
        
        var adres1 = data['adress1'] || data['adres1'] || "";
        var adres2 = data['adress2'] || data['adres2'] || "";
        var miasto = data['city'] || data['miasto'] || "";
        setData("adress", adres1 + "<br>" + adres2 + " " + miasto);

        setData("mdow_series", data['mdow_series'] || '');
        setData("expiry_date", data['expiry_date'] || '');
        setData("issue_date", data['issue_date'] || '');
        setData("father_name", data['father_name'] || '');
        setData("mother_name", data['mother_name'] || '');

        // Ustawianie płci
        var sex = data['sex'] || data['plec'] || "";
        if (sex) {
            if (sex.toLowerCase().startsWith("m")){
                sex = "Mężczyzna";
            } else if (sex.toLowerCase().startsWith("k")){
                sex = "Kobieta";
            }
        }
        setData("sex", sex);

        // Ustawianie daty urodzenia i generowanie PESELu
        var birthday = data['birthday'] || data['dataUrodzenia']; 
        if (birthday) {
            var birthdaySplit = birthday.split(".");
            var day = parseInt(birthdaySplit[0]);
            var month = parseInt(birthdaySplit[1]);
            var year = parseInt(birthdaySplit[2]);

            var birthdayDate = new Date();
            birthdayDate.setDate(day);
            birthdayDate.setMonth(month-1);
            birthdayDate.setFullYear(year);

            setData("birthday", birthdayDate.toLocaleDateString("pl-PL", options));

            if (parseInt(year) >= 2000){
              month = 20 + month;
            }

            var later = (sex === "Mężczyzna") ? "0295" : "0382";
            if (day < 10){ day = "0" + day; }
            if (month < 10){ month = "0" + month; }

            var pesel = year.toString().substring(2) + month + day + later + "7";
            setData("pesel", data['pesel'] || pesel); 
        } else {
            // Przypisanie PESELu nawet jeśli brakuje daty urodzenia do wygenerowania domyślnego
            setData("pesel", data['pesel'] || ""); 
        }

        // Generowanie daty zameldowania
        if (localStorage.getItem("homeDate") == null){
            var homeDay = getRandom(1, 25);
            var homeMonth = getRandom(0, 12);
            var homeYear = getRandom(2012, 2019);

            var homeDate = new Date();
            homeDate.setDate(homeDay);
            homeDate.setMonth(homeMonth);
            homeDate.setFullYear(homeYear);

            localStorage.setItem("homeDate", homeDate.toLocaleDateString("pl-PL", options));
        }

        var homeDateElement = document.querySelector(".home_date");
        if (homeDateElement) {
            homeDateElement.innerHTML = localStorage.getItem("homeDate");
        }
    }
}

// ODPYTYWANIE SERWERA LUB TRYB OFFLINE
if (token) {
    fetch(`https://mka52.pythonanywhere.com/api/data/${token}`)
    .then(response => response.json())
    .then(responseObj => {
        if(responseObj.status === "success") {
            const data = responseObj.dane; 
            
            // Zapisz kopię zapasową w pamięci urządzenia
            localStorage.setItem("mObywatel_Offline_Kopia", JSON.stringify(data));
            
            // Wypełnij stronę danymi z serwera
            wypelnijWszystkieDane(data);
        }
    })
    .catch(error => {
        console.warn("Tryb offline - ładuję kopię z pamięci!");
        const offlineData = JSON.parse(localStorage.getItem("mObywatel_Offline_Kopia"));
        
        if (offlineData) {
            wypelnijWszystkieDane(offlineData);
        }
    });
} else {
    window.location.href = "gen.html";
}

function setData(id, value){
  var element = document.getElementById(id);
  if (element) {
    element.innerHTML = value;
  }
}

function getRandom(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}

// Activate bottom nav tab from query param ?tab=home|services|qr|more
(function(){
  try{
    var tab = (new URLSearchParams(window.location.search).get('tab')||'home').toLowerCase();
    var valid = ['home','services','qr','more'];
    if (!valid.includes(tab)) tab = 'home';
    var imgs = document.querySelectorAll('.bottom_element_image');
    var texts = document.querySelectorAll('.bottom_element_text');
    var openClasses = ['home_open','services_open','qr_open','more_open'];
    imgs.forEach(function(img){ openClasses.forEach(c=>img.classList.remove(c)); });
    texts.forEach(function(t){ t.classList.remove('open'); });
    document.querySelectorAll('.bottom_element_grid').forEach(function(el){
      var send = el.getAttribute('send');
      var img = el.querySelector('.bottom_element_image');
      var txt = el.querySelector('.bottom_element_text');
      if (send===tab){ if(img) img.classList.add(tab+'_open'); if(txt) txt.classList.add('open'); }
    });
  }catch(e){}
})();

// OBSŁUGA MOREID.HTML - wczytanie danych z lokalnej kopii
if (window.location.pathname.includes('moreid.html')) {
    var moreidData = localStorage.getItem('mObywatel_Offline_Kopia') || localStorage.getItem('mObywatelData');
    if (moreidData) {
        var moreidDataObj = JSON.parse(moreidData);
        setData('moreid_mdow_series', moreidDataObj['mdow_series'] || '');
        setData('moreid_expiry_date', moreidDataObj['expiry_date'] || '');
        setData('moreid_issue_date', moreidDataObj['issue_date'] || '');
    }
}