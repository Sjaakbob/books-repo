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
   
    const body = document.body;
    let table;
    let sortColumnIndex = -1;
    let sortAscending = true;
    let booksData = []; // Declare booksData globally
    let isPlaying = false;

     //const musicFolder = 'music'; // Folder containing the audio files
     const musicFiles = ['music/classical-musical-serenade-of-simplicity.mp3', 
        'music/ethereal-elegy.mp3', 
        'music/enchanted-dance-208328.mp3',
        'music/enchanted-forest-frolic-pop-music-202481.mp3',
        'music/eternal-serenade-213495.mp3',
        'music/melody-of-strings-216149.mp3',
        'music/peaceful-piano-background-music-218762.mp3',]; // List of song files

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
     // Select a random placeholder
     const randomPlaceholder = placeholder[Math.floor(Math.random() * placeholder.length)];

     // Set the random placeholder
     const searchInput = document.getElementById('searchInput');
     searchInput.placeholder = randomPlaceholder;

    async function toggleMusic() {
        if (!isPlaying) {
            try {
                playRandomSong(); // Call the function to play a random song
                toggleMusicButton.textContent = 'Pause Music';
                isPlaying = true;
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        } else {
            try {
                audioPlayer.pause();
                toggleMusicButton.textContent = 'Play Music';
                isPlaying = false;
            } catch (error) {
                console.error('Error pausing audio:', error);
            }
        }
    }
    
    function playRandomSong() {
        let randomIndex;
        let selectedSong;
        
        // Ensure a new random song is selected
        do {
            randomIndex = Math.floor(Math.random() * musicFiles.length);
            selectedSong = musicFiles[randomIndex];
        } while (selectedSong === audioPlayer.src);
    
        audioPlayer.src = selectedSong;
        audioPlayer.style.display = 'block';
    
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    
    toggleMusicButton.addEventListener('click', toggleMusic);
    
    audioPlayer.addEventListener('ended', function () {
        playRandomSong(); // Automatically play the next random song when the current one ends
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

    // Attach a change event listener to the darkModeToggle
    darkModeToggle.addEventListener('change', toggleMode);

    // Initial call to set the correct mode based on the toggle state
    toggleMode();

    // Function to sort table
    function sortTable(columnIndex) {
        const rows = Array.from(table.querySelectorAll("tbody tr"));

        rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent.toLowerCase();
            const bValue = b.children[columnIndex].textContent.toLowerCase();

            if (sortAscending) {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        // Clear the table body
        while (table.querySelector("tbody").firstChild) {
            table.querySelector("tbody").removeChild(table.querySelector("tbody").firstChild);
        }

        // Re-add the sorted rows to the table
        rows.forEach(row => {
            table.querySelector("tbody").appendChild(row);
        });

        // Update sortColumnIndex and sortAscending variables
        sortColumnIndex = columnIndex;
        sortAscending = !sortAscending;
    }
    rainbowButton.addEventListener('click', function () {
        //print("nu is er een regenboog");
       // debug.console.log("nu is er een regeonbook");
        body.classList.toggle('rainbow');
    });

    // Event listener for sorting when a table header is clicked
    function attachSortEventListeners() {
        if (!table) return; // Ensure table is defined before attaching listeners

        table.querySelectorAll("thead th").forEach((header, index) => {
            header.addEventListener("click", () => {
                sortTable(index);
            });
        });
    }

    // Function to toggle the visibility of the paragraph
    function toggleContent() {
        if (disclaimer.style.display === "none" || disclaimer.style.display === "") {
            disclaimer.style.display = "block"; // Show the paragraph
           // debug.console.log("nu is er een tekst");
            window.scrollTo({top:0, behavior: 'smooth'});
            toggleButton.textContent = "Hide explanation";
        } else {
            disclaimer.style.display = "none"; // Hide the paragraph
            window.scrollTo({top:0, behavior: 'smooth'});
            toggleButton.textContent = "Explanation";
        }
    }

    // Attach a click event listener to the button
    toggleButton.addEventListener("click", toggleContent);

    // Function to include Papa Parse library dynamically
    function includePapaParse(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Function to fetch and parse CSV file
    function loadCSV() {
        const cacheBuster = Math.random(); // Cache buster to force reload
        fetch(`books.csv?cache=${cacheBuster}`)
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    complete: function(results) {
                        booksData = results.data; // Store parsed data in booksData array
                        displayTable(booksData);
                    }
                });
            })
            .catch(error => console.error('Error loading the CSV file:', error));
    }

    // Function to display the parsed CSV data in a table
    function displayTable(data) {
        table = document.createElement('table');
        table.border = '1';

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Book', 'Author', 'Recommended', 'Language', 'Comments'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.classList.add('sortable'); // Add sortable class to make headers clickable
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
        tableContainer.innerHTML = ''; // Clear previous table if any
        tableContainer.appendChild(table);

        // Attach sorting event listeners after table is populated
        attachSortEventListeners();

        // Initialize search functionality
        initializeSearch();
    }

    // Function to initialize search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearSearchButton = document.getElementById('clearSearch');

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            // Filter rows based on search term
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                let found = false;
                row.querySelectorAll('td').forEach(cell => {
                    if (cell.textContent.toLowerCase().includes(searchTerm)) {
                        found = true;
                    }
                });
                if (found) {
                    row.style.display = ''; // Show matching row
                } else {
                    row.style.display = 'none'; // Hide non-matching row
                }
            });
        });
        // Functionality to clear search input and show all rows
        clearSearchButton.addEventListener('click', function() {
            searchInput.value = ''; // Clear search input
            Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
                row.style.display = ''; // Show all rows
            });
        });
    }   
  
    
            // Function to handle button click
        function handleButtonClick() {
            // Calculate total number of books
            const totalBooks = booksData.length;
            const totalAuthors = booksData.filter(book=> book.author.length);
            //const totalAuthors = booksData.author.length;
            
            // Calculate number of books in English
            const englishBooks = booksData.filter(book => book.Language === 'English').length;

            const dutchBooks = booksData.filter(book => book.Language === 'Dutch').length;
            const germanBooks = booksData.filter(book => book.Language === 'German').length;
            const chineseBooks = booksData.filter(book => book.Language === 'Chinese').length;

            const absolutelyBooks = booksData.filter(book => book.Recommended === 'Absolutely!').length;
            const yesBooks = booksData.filter(book => book.Recommended === 'Yes').length;
            const maybeBooks = booksData.filter(book => book.Recommended === 'Maybe').length;
            const noBooks = booksData.filter(book => book.Recommended === 'No').length;
            // Display total number of books using an alert
            alert(`Number of books read: ${totalBooks}\n Total authors: ${totalAuthors}
                \nBooks in English: ${englishBooks}\nBooks in Dutch: ${dutchBooks}\nBooks in German: ${germanBooks}\nBooks in Chinese: ${chineseBooks}
                \nAbsolutely!: ${absolutelyBooks}\nYes: ${yesBooks}\nMaybe: ${maybeBooks}\nNo: ${noBooks}`);
        }
    
        // Attach click event listener to the button
        statsButton.addEventListener('click', handleButtonClick);

    // Function to choose a random book
    function chooseRandomBook() {
        if (!booksData || booksData.length === 0) {
            console.error('No books loaded or booksData is empty.');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * booksData.length);
        const randomBook = booksData[randomIndex];
        
        // Example: Adjust according to your actual CSV structure
        const title = randomBook.Title; // Check the actual key name in your CSV data
    
        // Update the search input with the title of the random book
        const searchInput = document.getElementById('searchInput');
        searchInput.value = title;
    
        // Trigger input event to initiate the search based on the new value
        searchInput.dispatchEvent(new Event('input'));
         // Close the disclaimer if it's open
         if (disclaimer.style.display === "block" || disclaimer.style.display === "") {
            disclaimer.style.display = "none";
            toggleButton.textContent = "Explanation";
        }
    
    }
    
    // Event listener for the random book button
    const randomBookButton = document.getElementById('randomBookButton');
    randomBookButton.addEventListener('click', chooseRandomBook);
    

    // Load the CSV file and Papa Parse library when the page loads
    includePapaParse(loadCSV);
});
