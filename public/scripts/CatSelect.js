import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firestore } from './firebaseInit.js';

document.addEventListener('DOMContentLoaded', init);


function init() {
    fetchCategories();
    document.getElementById('start').addEventListener('click', saveDataAndRedirect);
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

function onRejected(error) {
    console.error("Error: ", error);
}

async function onCategorySelect() {
    const categorySelect = document.getElementById('category-select');
    const selectedCategoryName = categorySelect.options[categorySelect.selectedIndex].textContent;
    localStorage.setItem('categoryName', selectedCategoryName);
    await syncScoresFromFirebase(selectedCategoryName);
    displayTopScores(selectedCategoryName);
}

function saveDataAndRedirect() {
    const categorySelect = document.getElementById('category-select');
    const difficultySelect = document.getElementById('difficulty-select');

    const selectedCategory = categorySelect.value;
    const selectedCategoryName = categorySelect.options[categorySelect.selectedIndex].textContent;
    const selectedDifficulty = difficultySelect.value;

    localStorage.setItem('category', selectedCategory);
    localStorage.setItem('categoryName', selectedCategoryName);
    localStorage.setItem('difficulty', selectedDifficulty);

    window.location.href = 'TheQuiz.html';
}

var db;

function displayScoresInHTML(scores) {
    const container = document.getElementById('scoreTableContainer');
    container.innerHTML = '';
    if (scores.length === 0) {
        const noScoresElement = document.createElement('div');
        noScoresElement.textContent = 'No scores submitted for this category.';
        container.appendChild(noScoresElement);
        return;
    }
    const table = document.createElement('table');
    table.id = 'scoreTable';
    table.className = 'striped highlight';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Username', 'Score', 'Category'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    scores.forEach(score => {
        const row = document.createElement('tr');
        ['username', 'score', 'category'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = score[key];
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function writeScoresToIndexedDB(scores) {
    const transaction = db.transaction(['scores'], 'readwrite');
    const store = transaction.objectStore('scores');
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
        scores.forEach(score => store.add(score));
    };
}

async function syncScoresFromFirebase(category) {
    try {
        const q = query(collection(firestore, 'scores'), where('category', '==', category.toLowerCase()));
        const snapshot = await getDocs(q);
        const scores = [];
        snapshot.forEach(doc => scores.push(doc.data()));
        scores.sort((a, b) => b.score - a.score);
        writeScoresToIndexedDB(scores);
    } catch (error) {
        console.error('Error syncing scores from Firebase:', error);
    }
}

function displayTopScores(category) {
    if (!category) return;

    const transaction = db.transaction(['scores'], 'readonly');
    const store = transaction.objectStore('scores');
    const index = store.index('category');
    const request = index.openCursor(IDBKeyRange.only(category.toLowerCase()));
    const scores = [];

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            scores.push(cursor.value);
            cursor.continue();
        } else {
            scores.sort((a, b) => b.score - a.score);
            displayScoresInHTML(scores.slice(0, 10));
        }
    };

    request.onerror = function(event) {
        console.log('Error retrieving scores:', event);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.indexedDB) {
        console.log('IndexedDB not supported.');
        return;
    }

    const request = indexedDB.open('quizDB', 2);
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        let scoreStore;
        if (!db.objectStoreNames.contains('scores')) {
            scoreStore = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
        } else {
            scoreStore = event.target.transaction.objectStore('scores');
        }
        if (!scoreStore.indexNames.contains('username')) {
            scoreStore.createIndex('username', 'username', { unique: false });
        }
        if (!scoreStore.indexNames.contains('category')) {
            scoreStore.createIndex('category', 'category', { unique: false });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };

    request.onerror = function(event) {
        console.log('Error opening database:', event);
    };
});

export { onCategorySelect };
