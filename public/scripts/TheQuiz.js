
// let variabelen heeft een block scope dit betekent dat deze waarde alleen maar kunnen gebruikt worden in de block,
// of functie waar ze gedeclareert worden dus ze kunnen alleen maar is dit script gebruikt worden 
// een let kan ook niet ge herdeclareert worden dit helpt bugs te voorkomen 
let correctAnswer = "";
let correctCounter = 0;


//deze functie wordt aangeroepen wanneer het document geladen wordt dit is een event 
//de code die in dit event staat zal uitgevoerd worden wanneer de pagina geladen wordt 
document.addEventListener('DOMContentLoaded', () => {
    // hier wordt een functie aangeroepen displayStoredData(); deze wordt hier onder deze functie aangemaakt
    //de functionaliteit zal daar besproken worden 
    displayStoredData();

    //hier wordt de timer functie aangeroepen die onderaan in de pagina 
    //wat wordt mee gegeven aan deze functie ?
    //hoelang deze timer zal draaien en waar deze timer zal worden afgebeeld
    //waar wordt deze afgebeeld ?? hier : document.getElementById('timer') zo roep je een html item op met behulp van een id 300 is 5 min 
    startTimer(90, document.getElementById('timer'));


    //deze code zal lijsteren naar het event click bij het element met id submit-answer in de html pagina 
    //dan zal hij de functie oproepen checkAnswer(correctAnswer); hier zie je dat de let correctAnswer wordt mee gegeven 
    //deze wordt opgevuld op het einde van de functie showData();  
    document.getElementById('submit-answer').addEventListener('click', () => {
        checkAnswer(correctAnswer);
    });
});


//hier heb je declaratie van de functie displayStoredData() deze zal opgeroepen worden bij heet laden van de pagina
//wat doet deze functie ??
//in de vorige pagina wordt er in het bijhorende script (CatSelect.js) 3 waarden meegeven naar hier 
//hier neem deze 3 waarden  categoryName , category , difficulty
//de naam zal afgebeeld worden in de html pagina 
//en de category en de difficulty zal meegeven worden aan de fetchNewQuestion() deze zal met deze waarden een vraag ophalen met de api van https://opentdb.com/
function displayStoredData() {

    //hier worden de items die megegeven zijn van de vorig pagina aan de hand van localStorage.getItem(),
    //meegeven naar 3 constanten omdat deze hier niet meer verandert moeten worden 
    //const = constante = niet veranderbaar 
    const category = localStorage.getItem('categoryName');
    const categoryId = localStorage.getItem('category');
    const difficulty = localStorage.getItem('difficulty');
    
    //hier roep ik het html element met id category op en geef het de constante waarde die nu in category zit mee
    //deze waarde zal worden afgebeeld in dat html element 
    document.getElementById('category').innerHTML = category;


    //deze if statement zal alleen uitgevoerd worden wanneer er een waarde in de constante ,
    //categoryId en difficulty zit dan zal dit een true geven in word de code er in uit gevoerd 
    if (categoryId && difficulty) {
        
        //hier wordt de fetchNewQuestion() aangeroepen we geven er de 2 conts waarden aan mee
        //categoryId en difficulty deze zullen worden gebruikt om in de api link te plaatsen
        //zo zal er een vraag naar keuze kunnen angevraagt woden aan de server
        fetchNewQuestion(categoryId, difficulty);
    }
}


//hier heb je de fetch function deze vraagt 2 waarden categoryId en difficulty 
//hier zal de vraag gestelt worden aan de server van https://opentdb.com/ om een quiz vraag te krijgen 
//als je een nieuwe vraag wilt ergens maakt niet uit waar moet deze functie aangeroepen worden 
//deze zal functie s dieper in de code aanspreken
function fetchNewQuestion(categoryId, difficulty) {
    
    //hier een let dus dit kan alleen in deze functie gebruikt worden 
    //kan ook niet geherdeclareert worden 
    //hier wordt de api url in gestoken met de categoryId en difficulty die hij meekrijgt van de functie zelf 
    //deze url word dan mee geven aan de fetch functie om dan de data van de vraag te vragen aan de server 
    let url = `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${difficulty}`;
    

    //dan heb je een fetch functie hier geven we de let url aan mee
    //deze zal gebruikt worden om om de vraag tegenereren
    //als hij de url mee geeft zal hij een promise returnen
    //een promise is thenable
    fetch(url)
        //die promise geeft een response in de vorm van json 
        //en wordt in response gestoken om dan later bruikbaar te maken in de quiz
        .then(response => response.json())
        //als dat een promise returnt dan zal de functie showData aangeroepen worden
        .then(showData)
        //als dat een promise returnt dan zal de functie onRejected aangeroepen worden
        .catch(onRejected);
}


//de onRejected functie zal een error returnen 
//als de .then(showData) niet kan worden uitgevoerd in de code hierboven
function onRejected(error) {
    //dit print de errors naar de console help bij debuggen om te kijken wat er verkeerd is gegaan 
    console.error("Error: ", error);
}


//de show data functie wordt ook aangeroepen in de functie fetchNewQuestion()
//eerst zal de fetch functie worden aan geroepen in de functie fetchNewQuestion()
//dan zal dit een json bestand geven deie word dan meegeven aan deze functie 
//dus hier heb je al de json data hie zeven we alles 
//steken we de gewilde data in de correcte html elementen 
function showData(jsonData) {

    //weer 2 constanten de krijgen de de waarden 
    //2 html waarden question en choices 
    //in question daar zal de vraag worden afgebeeld die je krijgt van de json data 
    //in choices zullen de verschillende keuze die je kan kieze die zitten ook in de json data 
    //dit zal dan gebruikt worden om het juiste antwoord en het gekozen antwoord met elkaar vergelijken
    const question = document.getElementById("question");
    const choicesContainer = document.getElementById("choices");

    const data = jsonData.results[0];

    question.innerHTML = data.question;

    choicesContainer.innerHTML = "";

    if (data.type === "multiple") {
        const choices = [...data.incorrect_answers, data.correct_answer];
        shuffleArray(choices);

        choices.forEach(choice => {
            const choiceElement = document.createElement("div");
            const inputElement = document.createElement("input");
            const labelElement = document.createElement("label");

            inputElement.type = "radio";
            inputElement.name = "choice";
            inputElement.value = choice;

            labelElement.textContent = choice;
            labelElement.prepend(inputElement);

            choiceElement.appendChild(labelElement);
            choicesContainer.appendChild(choiceElement);
        });
    } else if (data.type === "boolean") {
        choicesContainer.innerHTML = `
            <div>
                <label><input type="radio" name="choice" value="True"> True</label>
            </div>
            <div>
                <label><input type="radio" name="choice" value="False"> False</label>
            </div>
        `;
    }

    correctAnswer = data.correct_answer;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkAnswer(correct) {
    const selected = document.querySelector('input[name="choice"]:checked');
    if (selected) {
        if (selected.value === correct) {
            alert('Correct!');
            correctCounter++;
            document.getElementById('correct-counter').textContent = correctCounter;
            sendScoreToSerial(correctCounter);  // Call function to send score via serial
        } else {
            alert(`Not correct! The correct answer is: ${correct}`);
        }
        fetchNewQuestion(localStorage.getItem('category'), localStorage.getItem('difficulty'));
    } else {
        alert('Please select an answer.');
    }
}

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(interval);
            localStorage.setItem('totalScore', correctCounter);
            localStorage.setItem('categoryName', document.getElementById('category').innerText);
            window.location.href = "EindeQuiz.html";
        }
    }, 1000);
}
