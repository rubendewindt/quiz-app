        // Global variable for the database
        var db;

        // Function to display all scores in the HTML
        function displayScoresInHTML(scores) {
            var scoreTableContainer = document.getElementById('scoreTableContainer');
            scoreTableContainer.innerHTML = ''; // Clear previous content

            if (scores.length === 0) {
                var noScoresElement = document.createElement('div');
                noScoresElement.textContent = 'No scores submitted for this category.';
                scoreTableContainer.appendChild(noScoresElement);
            } else {
                var table = document.createElement('table');
                table.id = 'scoreTable';
                table.className = 'striped highlight';

                var thead = document.createElement('thead');
                var headerRow = document.createElement('tr');
                var headers = ['Username', 'Score', 'Category'];

                headers.forEach(headerText => {
                    var th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                var tbody = document.createElement('tbody');

                scores.forEach(function(score) {
                    var row = document.createElement('tr');
                    var usernameCell = document.createElement('td');
                    var scoreCell = document.createElement('td');
                    var categoryCell = document.createElement('td');

                    usernameCell.textContent = score.username;
                    scoreCell.textContent = score.score;
                    categoryCell.textContent = score.category;

                    row.appendChild(usernameCell);
                    row.appendChild(scoreCell);
                    row.appendChild(categoryCell);
                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                scoreTableContainer.appendChild(table);
            }

            console.log('Displayed scores:', scores); // Log the scores displayed
        }

        // Function to display top 10 scores for a specific category
        function displayTopScores(category) {
            console.log('Displaying scores for category:', category); // Log the category

            var transaction = db.transaction(["scores"], "readonly");
            var scoreStore = transaction.objectStore("scores");
            var index = scoreStore.index("category");
            var request = index.openCursor(IDBKeyRange.only(category.toLowerCase()));
            var scores = [];

            request.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    console.log('Found score:', cursor.value); // Log each found score
                    scores.push(cursor.value);
                    cursor.continue();
                } else {
                    console.log("No more entries");
                    // Sort scores in descending order and get the top 10
                    scores.sort((a, b) => b.score - a.score);
                    var topScores = scores.slice(0, 10);
                    displayScoresInHTML(topScores); // Display scores in HTML
                }
            };

            request.onerror = function(event) {
                console.log("Error retrieving scores:", event);
            };
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Ensure IndexedDB is supported
            if (!window.indexedDB) {
                console.log("IndexedDB not supported.");
                return;
            }

            // Open (or create) the database
            var request = indexedDB.open("quizDB", 2); // Requesting version 2

            // Handle database upgrades
            request.onupgradeneeded = function(event) {
                db = event.target.result;
                var scoreStore;
                // Create an object store for user scores with auto-increment key
                if (!db.objectStoreNames.contains("scores")) {
                    scoreStore = db.createObjectStore("scores", { keyPath: "id", autoIncrement: true });
                } else {
                    scoreStore = event.target.transaction.objectStore("scores");
                }

                if (!scoreStore.indexNames.contains("username")) {
                    scoreStore.createIndex("username", "username", { unique: false });
                }
                if (!scoreStore.indexNames.contains("category")) {
                    scoreStore.createIndex("category", "category", { unique: false });
                }
            };

            request.onsuccess = function(event) {
                db = event.target.result;
                const category = (localStorage.getItem('categoryName') || '').toLowerCase();
                console.log('Database opened successfully. Category:', category); // Log the retrieved category
                if (category) {
                    displayTopScores(category);
                } else {
                    console.log("No category found in localStorage.");
                }
            };

            request.onerror = function(event) {
                console.log("Error opening database:", event);
            };

            const totalScore = localStorage.getItem('totalScore');
            const category = (localStorage.getItem('categoryName') || '').toLowerCase();
            document.getElementById('correct-counter').textContent = totalScore;

            document.getElementById('submit-form-btn').addEventListener('click', function(event) {
                document.getElementById('submit-btn').click();
            });

            document.getElementById('username-form').addEventListener('submit', function(event) {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const totalScore = parseInt(localStorage.getItem('totalScore'), 10) || 0;

                storeUserScore(username, totalScore, category);
                localStorage.setItem('username', username);
                window.location.href = "index.html";
            });
        });

        // Function to store username, score, and category
        function storeUserScore(username, score, category) {
            var transaction = db.transaction(["scores"], "readwrite");
            var scoreStore = transaction.objectStore("scores");

            var userScore = {
                username: username,
                score: score,
                category: category.toLowerCase()
            };

            var request = scoreStore.add(userScore);

            request.onsuccess = function() {
                console.log("Score added:", userScore);
            };

            request.onerror = function(event) {
                console.log("Error adding score:", event);
            };
        }