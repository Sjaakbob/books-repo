document.addEventListener("DOMContentLoaded", function () {
    const tableContainer = document.getElementById('tableContainer');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const lightStylesheet = document.getElementById('lightStylesheet');
    const darkStylesheet = document.getElementById('darkStylesheet');
    const toggleButton = document.getElementById('disclaimerButton');
    const disclaimer = document.getElementById('disclaimer');
    const statsButton = document.getElementById('statsButton');
    const rainbowButton = document.getElementById('rainbowButton');
    const toggleMusicButton = document.getElementById('musicButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const searchInput = document.getElementById('searchInput');
    const body = document.body;
    
    let table;
    let sortColumnIndex = -1;
    let sortAscending = true;
    let booksData = [];
    let isPlaying = false;
    let previousSong = null;

    const musicFiles = [
        'music/beneath-the-infinite-sky-225669.mp3',
        'music/classical-musical-serenade-of-simplicity.mp3',
        'music/dialogues-with-the-past-225668.mp3', 
        'music/dim-meditation-396-hz-227138.mp3',
        'music/dreamtime-222922.mp3',
        'music/enchanted-dance-208328.mp3',
        'music/enchanted-forest-frolic-pop-music-202481.mp3',
        'music/epic-odyssey-western-classical-music-201986.mp3',
        'music/eternal-serenade-213495.mp3',
        'music/ethereal-elegy.mp3',
        'music/find-your-zen-2-222923.mp3',
        'music/inner-peace-222955.mp3',
        'music/light-contours-ai-213696.mp3',
        'music/melancholy_score_original-219042.mp3',
        'music/melody-of-strings-216149.mp3',
        'music/peaceful-piano-background-music-218762.mp3',
        'music/relaxing-music-serenity-213078.mp3',
        'music/sprint-of-light-ai-213695.mp3',
        'music/the-final-page-softly-turned-225663.mp3',
        'music/whisper-in-the-rain-225656.mp3',
    ];

    const placeholder = [
        "Search a wonderful book...",
        "Try a fantastic book...",
        "Look up a mythical book...",
        "Peruse my book selection...",
        "Find a book of choice...",
        "Type your favorite book...",
        "Check my book collection...",
        "Books, books, books...",
        "Seek a book of destiny...",
        "Venture into my bookcase...",
        "Give my books a shot..."
    ];    

    // Set a random placeholder
    searchInput.placeholder = placeholder[Math.floor(Math.random() * placeholder.length)];

    // Function to fetch and parse CSV file
    function loadCSV() {
        const cacheBuster = Math.random();
        fetch(`books.csv?cache=${cacheBuster}`)
            .then(response => response.ok ? response.text() : Promise.reject(response.status))
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    complete: function(results) {
                        booksData = results.data;
                        if (booksData && booksData.length > 0) {
                            displayTable(booksData);
                        } else {
                            console.error('Parsed data is empty or improperly formatted.');
                        }
                    },
                    error: function(error) {
                        console.error('Error parsing CSV:', error);
                    }
                });
            })
            .catch(error => console.error('Error loading the CSV file:', error));
    }

    // Function to display the parsed CSV data in a table
    function displayTable(data) {
        if (!tableContainer) {
            console.error('Table container element not found.');
            return;
        }

        table = document.createElement('table');
        table.border = '1';

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Book', 'Author', 'Recommended', 'Language', 'Comments'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.classList.add('sortable');
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Append table to container
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);

        // Attach sorting event listeners after table is populated
        attachSortEventListeners();

        // Initialize search functionality
        initializeSearch();
    }

    // Function to play a random song
    function playRandomSong() {
        let randomIndex;
        let selectedSong;
        
        do {
            randomIndex = Math.floor(Math.random() * musicFiles.length);
            selectedSong = musicFiles[randomIndex];
        } while (selectedSong === audioPlayer.src || selectedSong === previousSong); // Ensure the new song is different from the current and previous one
    
        previousSong = audioPlayer.src; // Update previous song to current one
        audioPlayer.src = selectedSong;
        

    
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    
    // Event listener for when the current song ends
    audioPlayer.addEventListener('ended', function() {
        playRandomSong(); // Play the next random song when the current one ends
    });

    // Function to toggle between light and dark stylesheets
    function toggleMode() {
        if (darkModeToggle.checked) {
            lightStylesheet.disabled = true;
            darkStylesheet.disabled = false;
            document.querySelector('label[for="darkModeToggle"]').classList.remove('custom-checkbox-light');
            document.querySelector('label[for="darkModeToggle"]').classList.add('custom-checkbox-dark');
        } else {
            lightStylesheet.disabled = false;
            darkStylesheet.disabled = true;
            document.querySelector('label[for="darkModeToggle"]').classList.remove('custom-checkbox-dark');
            document.querySelector('label[for="darkModeToggle"]').classList.add('custom-checkbox-light');
        }
    }

    // Function to sort the table
    function sortTable(columnIndex) {
        const rows = Array.from(table.querySelectorAll("tbody tr"));

        rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent.toLowerCase();
            const bValue = b.children[columnIndex].textContent.toLowerCase();

            return sortAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

        // Clear the table body and re-add sorted rows
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));

        sortColumnIndex = columnIndex;
        sortAscending = !sortAscending;
    }

    // Event listener for sorting when a table header is clicked
    function attachSortEventListeners() {
        table.querySelectorAll("thead th").forEach((header, index) => {
            header.addEventListener("click", () => {
                sortTable(index);
            });
        });
    }

    // Function to toggle the visibility of the paragraph
    function toggleContent() {
        if (disclaimer.style.display === "none" || disclaimer.style.display === "") {
            disclaimer.style.display = "block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toggleButton.textContent = "Hide explanation";
        } else {
            disclaimer.style.display = "none";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toggleButton.textContent = "Explanation";
        }
    }

    // Function to initialize search functionality
    function initializeSearch() {
        const clearSearchButton = document.getElementById('clearSearch');

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const found = Array.from(row.querySelectorAll('td'))
                                  .some(cell => cell.textContent.toLowerCase().includes(searchTerm));
                row.style.display = found ? '' : 'none';
            });
        });

        clearSearchButton.addEventListener('click', function() {
            searchInput.value = '';
            Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
                row.style.display = '';
            });
        });
    }

    // Function to choose a random book
    function chooseRandomBook() {
        if (!booksData || booksData.length === 0) {
            console.error('No books loaded or booksData is empty.');
            return;
        }
    
        const randomIndex = Math.floor(Math.random() * booksData.length);
        const randomBook = booksData[randomIndex];
    
        if (!randomBook || typeof randomBook !== 'object') {
            console.error('Selected randomBook is invalid.');
            return;
        }
    
        console.log('Selected random book:', randomBook);
    
        // Adjust according to your CSV structure
        const title = randomBook.Title || randomBook.title || randomBook.BookTitle || ''; // Check for various possible key names
    
        if (!title) {
            console.error('Title is undefined or empty for the selected book.');
            return;
        }
    
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) {
            console.error('Search input element not found.');
            return;
        }
    
        searchInput.value = title;
        searchInput.dispatchEvent(new Event('input'));
    
        const disclaimer = document.getElementById('disclaimer');
        if (disclaimer && (disclaimer.style.display === "block" || disclaimer.style.display === "")) {
            disclaimer.style.display = "none";
            const toggleButton = document.getElementById('toggleButton');
            if (toggleButton) {
                toggleButton.textContent = "Explanation";
            }
        }
    }

    // Function to handle stats button click
    function handleButtonClick() {
        const totalBooks = booksData.length;
        const allAuthors = booksData.flatMap(book => 
            book.author ? book.author.split(',').map(a => a.trim()) : []
        );
        const uniqueAuthors = Array.from(new Set(allAuthors));
        const recommendedBooks = booksData.filter(book => 
            book.recommended && book.recommended.toLowerCase() === 'yes'
        );
        const languageCounts = booksData.reduce((acc, book) => {
            const lang = book.language || 'Unknown';
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
        }, {});

        const statsText = `
            Total Books: ${totalBooks}
            Total Unique Authors: ${uniqueAuthors.length}
            Total Recommended Books: ${recommendedBooks.length}
            Language Distribution: ${Object.entries(languageCounts)
                .map(([lang, count]) => `${lang}: ${count}`).join(', ')}
        `;

        alert(statsText);
    }

    // Function to toggle rainbow mode
    function toggleRainbowMode() {
        if (body.classList.contains('rainbow-mode')) {
            body.classList.remove('rainbow-mode');
            rainbowButton.textContent = 'Rainbow Mode';
        } else {
            body.classList.add('rainbow-mode');
            rainbowButton.textContent = 'Disable Rainbow Mode';
        }
    }

    // Event listeners
    darkModeToggle.addEventListener("change", toggleMode);
    toggleButton.addEventListener("click", toggleContent);
    statsButton.addEventListener("click", handleButtonClick);
    rainbowButton.addEventListener("click", toggleRainbowMode);
    toggleMusicButton.addEventListener("click", playRandomSong);
    document.getElementById('randomBookButton').addEventListener("click", chooseRandomBook);

    // Load CSV data
    loadCSV();
});
