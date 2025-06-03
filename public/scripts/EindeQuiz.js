import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firestore } from './firebaseInit.js';

let dbIndexed;

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
    const transaction = dbIndexed.transaction(['scores'], 'readwrite');
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
        displayScoresInHTML(scores.slice(0, 10));
    } catch (error) {
        console.error('Error syncing scores from Firebase:', error);
    }
}

function displayTopScores(category) {
    const transaction = dbIndexed.transaction(['scores'], 'readonly');
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
}

async function storeScoreFirebase(username, score, category) {
    try {
        await addDoc(collection(firestore, 'scores'), {
            username,
            score,
            category: category.toLowerCase()
        });
    } catch (error) {
        console.error('Error storing score to Firebase:', error);
    }
}

function storeUserScore(username, score, category) {
    const transaction = dbIndexed.transaction(['scores'], 'readwrite');
    const store = transaction.objectStore('scores');
    const userScore = { username, score, category: category.toLowerCase() };
    store.add(userScore);
    storeScoreFirebase(username, score, category).then(() => syncScoresFromFirebase(category));
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.indexedDB) {
        console.log('IndexedDB not supported.');
        return;
    }

    const request = indexedDB.open('quizDB', 2);
    request.onupgradeneeded = event => {
        dbIndexed = event.target.result;
        let store;
        if (!dbIndexed.objectStoreNames.contains('scores')) {
            store = dbIndexed.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
        } else {
            store = event.target.transaction.objectStore('scores');
        }
        if (!store.indexNames.contains('username')) {
            store.createIndex('username', 'username', { unique: false });
        }
        if (!store.indexNames.contains('category')) {
            store.createIndex('category', 'category', { unique: false });
        }
    };

    request.onsuccess = event => {
        dbIndexed = event.target.result;
        const category = (localStorage.getItem('categoryName') || '').toLowerCase();
        if (category) {
            syncScoresFromFirebase(category);
        }
    };

    request.onerror = event => {
        console.log('Error opening database:', event);
    };

    const totalScore = localStorage.getItem('totalScore');
    const category = (localStorage.getItem('categoryName') || '').toLowerCase();
    document.getElementById('correct-counter').textContent = totalScore;

    document.getElementById('submit-form-btn').addEventListener('click', () => {
        document.getElementById('submit-btn').click();
    });

    document.getElementById('username-form').addEventListener('submit', event => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const totalScoreValue = parseInt(localStorage.getItem('totalScore'), 10) || 0;
        storeUserScore(username, totalScoreValue, category);
        localStorage.setItem('username', username);
        window.location.href = 'index.html';
    });
});
