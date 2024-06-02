let correctAnswer = "";
let correctCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    displayStoredData();
    startTimer(300, document.getElementById('timer'));

    document.getElementById('submit-answer').addEventListener('click', () => {
        checkAnswer(correctAnswer);
    });
});

function displayStoredData() {
    const category = localStorage.getItem('categoryName');
    const categoryId = localStorage.getItem('category');
    const difficulty = localStorage.getItem('difficulty');

    document.getElementById('category').innerHTML = category;

    if (categoryId && difficulty) {
        fetchNewQuestion(categoryId, difficulty);
    }
}

function fetchNewQuestion(categoryId, difficulty) {
    let url = `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${difficulty}`;

    fetch(url)
        .then(response => response.json())
        .then(showData)
        .catch(onRejected);
}

function onRejected(error) {
    console.error("Error: ", error);
}

function showData(jsonData) {
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
