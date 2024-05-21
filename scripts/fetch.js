document.addEventListener('DOMContentLoaded', init);

function init() {
    fetchCategories();
    document.getElementById('category-select').addEventListener('change', fetchQuestion);
    document.getElementById('difficulty-select').addEventListener('change', fetchQuestion);
}

function fetchCategories() {
    fetch("https://opentdb.com/api_category.php")
        .then(response => response.json())
        .then(data => populateCategories(data.trivia_categories))
        .catch(onRejected);
}

function populateCategories(categories) {
    const categorySelect = document.getElementById('category-select');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function fetchQuestion() {
    const categorySelect = document.getElementById('category-select');
    const difficultySelect = document.getElementById('difficulty-select');

    const categoryId = categorySelect.value;
    const difficulty = difficultySelect.value;

    if (categoryId && difficulty) { // Check if both category and difficulty are selected
        let url = `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${difficulty}`;

        fetch(url)
            .then(onFulfilled)
            .then(showData)
            .catch(onRejected);
    }
}

function onFulfilled(response) {
    return response.json();
}

function onRejected(error) {
    console.log("Error: ", error);
}

function showData(jsonData) {
    const question = document.getElementById("question");
    const answer = document.getElementById("answer");
    const questionType = document.getElementById("question-type");
    const choicesContainer = document.getElementById("choices");

    const data = jsonData.results[0];
    
    question.innerHTML = data.question;
    answer.innerHTML = data.correct_answer;
    questionType.innerHTML = data.type.charAt(0).toUpperCase() + data.type.slice(1); // Capitalize first letter

    choicesContainer.innerHTML = ""; // Clear previous choices

    if (data.type === "multiple") {
        const choices = [...data.incorrect_answers, data.correct_answer];
        shuffleArray(choices); // Shuffle the choices

        choices.forEach(choice => {
            const choiceElement = document.createElement("div");
            choiceElement.textContent = choice;
            choicesContainer.appendChild(choiceElement);
        });
    } else if (data.type === "boolean") {
        choicesContainer.innerHTML = `
            <div>True</div>
            <div>False</div>
        `;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

