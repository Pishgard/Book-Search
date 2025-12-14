// API Configuration
const API_BASE = "https://api.bigbookapi.com";
const API_KEY = "da8a91022b244b16bb9762be2de68d02"; // Fixed API key

// DOM Elements
const qInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const subjectsEl = document.getElementById("subjects");
const booksGrid = document.getElementById("booksGrid");
const currentCategoryEl = document.getElementById("currentCategory");

// State
let CURRENT_CATEGORY = "";

// Initialize
setCurrentCategory("");

// Functions
function setCurrentCategory(name) {
    CURRENT_CATEGORY = name || "";
    if (!currentCategoryEl) return;
    if (!name) {
        currentCategoryEl.style.display = "none";
        currentCategoryEl.textContent = "";
    } else {
        currentCategoryEl.style.display = "block";
        currentCategoryEl.textContent = "Current Category: " + name;
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        statusEl.innerHTML = '<div class="center"><div class="loader"></div></div>';
    }
}

function clearResults() {
    subjectsEl.innerHTML = "";
    booksGrid.innerHTML = "";
}

function makeCard(book) {
    const div = document.createElement("div");
    div.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const imgUrl = book.image || "";
    if (imgUrl) {
        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = book.title || "cover";
        img.onerror = function() {
            this.parentElement.innerHTML =
                '<div class="no-image muted">No Image</div>';
        };
        thumb.appendChild(img);
    } else {
        thumb.innerHTML = '<div class="no-image muted">No Image</div>';
    }

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = book.title || "No Title";

    const authors = document.createElement("div");
    authors.className = "authors";
    if (book.authors && book.authors.length > 0) {
        const names = book.authors.map((a) => a.name || a);
        authors.textContent = names.join(", ");
    } else {
        authors.textContent = "Unknown Author";
    }

    const actions = document.createElement("div");
    actions.className = "actions";
    const infoBtn = document.createElement("button");
    infoBtn.className = "btn primary";
    infoBtn.textContent = "View Details";
    infoBtn.onclick = function(e) {
        e.stopPropagation();
        navigateToDetails(book);
    };
    actions.appendChild(infoBtn);

    div.onclick = function() {
        navigateToDetails(book);
    };

    div.appendChild(thumb);
    div.appendChild(title);
    div.appendChild(authors);
    div.appendChild(actions);
    return div;
}

function aggregateGenres(books) {
    const map = {};
    books.forEach((b) => {
        // Genres may not be directly available in API response
        // Need to use details endpoint
    });
    const arr = Object.keys(map).sort((a, b) => map[b] - map[a]);
    return arr.slice(0, 12);
}

function renderGenres(genres) {
    subjectsEl.innerHTML = "";
    if (!genres || genres.length === 0) return;
    genres.forEach((s) => {
        const b = document.createElement("button");
        b.className = "tag";
        b.textContent = s;
        b.onclick = function() {
            fetchByGenre(s);
        };
        subjectsEl.appendChild(b);
    });
}

function renderBooks(books) {
    booksGrid.innerHTML = "";
    if (books.length === 0) {
        statusEl.innerHTML = '<div class="status muted">No results found.</div>';
        return;
    }
    books.forEach((b) => {
        booksGrid.appendChild(makeCard(b));
    });
}

function handleFetchError(err) {
    console.error("API Error:", err);
    statusEl.innerHTML =
        '<div class="status muted">Error connecting to API. Please try again.</div>';
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

function normalizeBooksFromResponse(data) {
    const books = [];
    if (!data) return books;

    // According to API docs, response structure is:
    // { "books": [[{...}], [{...}]] }
    if (data.books && Array.isArray(data.books)) {
        data.books.forEach((item) => {
            if (Array.isArray(item)) {
                item.forEach((book) => {
                    if (book && book.id) {
                        books.push(book);
                    }
                });
            } else if (item && item.id) {
                books.push(item);
            }
        });
    } else if (Array.isArray(data)) {
        data.forEach((item) => {
            if (item && item.id) {
                books.push(item);
            }
        });
    }

    return books;
}

async function searchByQuery(q) {
    if (!q || !q.trim()) {
        statusEl.innerHTML =
            '<div class="status muted">Please enter a search query.</div>';
        return;
    }

    clearResults();
    setLoading(true);
    setCurrentCategory("");

    const url = `${API_BASE}/search-books?api-key=${encodeURIComponent(
        API_KEY
    )}&query=${encodeURIComponent(q.trim())}&number=24`;

    try {
        const data = await fetchJson(url);
        const books = normalizeBooksFromResponse(data);

        if (books.length === 0) {
            statusEl.innerHTML = '<div class="status muted">No results found.</div>';
            return;
        }

        statusEl.innerHTML = `<div class="status">Showing ${books.length} books — Click on a book to view details.</div>`;

        // Genres are not available in search-books response
        // Need to use details endpoint
        renderBooks(books);
    } catch (err) {
        handleFetchError(err);
    }
}

async function fetchByGenre(genre) {
    clearResults();
    setLoading(true);

    const url = `${API_BASE}/search-books?api-key=${encodeURIComponent(
        API_KEY
    )}&genres=${encodeURIComponent(genre)}&number=36`;

    try {
        const data = await fetchJson(url);
        const books = normalizeBooksFromResponse(data);

        if (books.length === 0) {
            statusEl.innerHTML =
                '<div class="status muted">No books found in this genre.</div>';
            return;
        }

        statusEl.innerHTML = `<div class="status">Showing ${books.length} books in genre "${genre}".</div>`;
        renderGenres([genre]);
        renderBooks(books);
        setCurrentCategory(genre);
    } catch (err) {
        handleFetchError(err);
    }
}

function navigateToDetails(book) {
    try {
        localStorage.setItem("selectedBook", JSON.stringify(book));
        localStorage.setItem("apiKey", API_KEY);
        window.location.href = "details.html";
    } catch (e) {
        console.error("Error saving data:", e);
        alert("Error navigating to details page");
    }
}

// Event Listeners
searchBtn.addEventListener("click", function() {
    const q = qInput.value.trim();
    searchByQuery(q);
});

qInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});

// Initialize status
statusEl.innerHTML =
    '<div class="status muted">To get started, search for a book title or topic.</div>';

