const API_BASE = "https://api.bigbookapi.com";

async function loadBookDetails() {
    try {
        const bookData = localStorage.getItem("selectedBook");
        const apiKey = localStorage.getItem("apiKey");

        if (!bookData) {
            showError(
                "Book information not found. Please select a book from the home page."
            );
            return;
        }

        const book = JSON.parse(bookData);

        // If we have book.id, fetch complete information from API
        if (book.id && apiKey) {
            try {
                const fullBookData = await fetchBookDetails(book.id, apiKey);
                renderBookDetails(fullBookData, apiKey);
            } catch (err) {
                console.error("Error fetching complete information:", err);
                // If error, show previous information
                renderBookDetails(book, apiKey);
            }
        } else {
            renderBookDetails(book, apiKey);
        }
    } catch (e) {
        console.error("Error loading information:", e);
        showError("Error loading book information.");
    }
}

async function fetchBookDetails(bookId, apiKey) {
    const url = `${API_BASE}/${bookId}?api-key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}

function showError(message) {
    const content = document.getElementById("content");
    content.innerHTML =
        '<div class="error-message">' +
        "<h2>Error</h2>" +
        "<p>" +
        escapeHtml(message) +
        "</p>" +
        '<a href="index.html" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Back to Home</a>' +
        "</div>";
}

function renderBookDetails(book, apiKey) {
    const content = document.getElementById("content");

    // Cover
    let coverHtml = "";
    const imgUrl = book.image || "";
    if (imgUrl) {
        coverHtml = `<img src="${escapeHtml(
      imgUrl
    )}" alt="Book cover" onerror="this.parentElement.innerHTML='<div class=\\'no-image\\'>No Image</div>'" />`;
    } else {
        coverHtml = '<div class="no-image">No Image</div>';
    }

    // Authors
    const authors = [];
    if (book.authors && book.authors.length) {
        book.authors.forEach((a) => {
            authors.push(a.name || a);
        });
    }
    const authorsText = authors.length ? authors.join(", ") : "Unknown";

    // Genres - may not be directly available in API
    let genresHtml = "";
    if (book.genres && book.genres.length) {
        genresHtml =
            '<div class="genres-list">' +
            book.genres
            .map((g) => `<span class="genre-tag">${escapeHtml(g)}</span>`)
            .join("") +
            "</div>";
    } else {
        genresHtml = '<span class="meta-value">—</span>';
    }

    // Description
    const description = book.description || "No description available.";

    // Rating
    let ratingHtml = "";
    if (book.rating && book.rating.average !== undefined) {
        const rating = (book.rating.average * 5).toFixed(1);
        ratingHtml = `<div class="meta-item">
      <span class="meta-label">Rating:</span>
      <span class="meta-value">
        <span class="rating">${rating} / 5.0</span>
      </span>
    </div>`;
    }

    // API URL
    let apiUrl = "";
    if (book.id && apiKey) {
        apiUrl = `${API_BASE}/${encodeURIComponent(
      book.id
    )}?api-key=${encodeURIComponent(apiKey)}`;
    }

    // Build HTML
    const html =
        '<div class="book-container">' +
        '<div class="book-header">' +
        '<div class="book-cover">' +
        coverHtml +
        "</div>" +
        '<div class="book-info">' +
        '<h1 class="book-title">' +
        escapeHtml(book.title || "No Title") +
        "</h1>" +
        '<div class="book-meta">' +
        '<div class="meta-item">' +
        '<span class="meta-label">Authors:</span>' +
        '<span class="meta-value">' +
        escapeHtml(authorsText) +
        "</span>" +
        "</div>" +
        (genresHtml ?
            '<div class="meta-item">' +
            '<span class="meta-label">Genres:</span>' +
            '<div class="meta-value">' +
            genresHtml +
            "</div>" +
            "</div>" :
            "") +
        ratingHtml +
        (book.identifiers && (book.identifiers.isbn_10 || book.identifiers.isbn_13) ?
            '<div class="meta-item">' +
            '<span class="meta-label">ISBN:</span>' +
            '<span class="meta-value">' +
            escapeHtml(
                book.identifiers.isbn_13 || book.identifiers.isbn_10 || "—"
            ) +
            "</span>" +
            "</div>" :
            book.isbn || book.isbn10 || book.isbn13 ?
            '<div class="meta-item">' +
            '<span class="meta-label">ISBN:</span>' +
            '<span class="meta-value">' +
            escapeHtml(book.isbn || book.isbn10 || book.isbn13) +
            "</span>" +
            "</div>" :
            "") +
        (book.number_of_pages ?
            '<div class="meta-item">' +
            '<span class="meta-label">Pages:</span>' +
            '<span class="meta-value">' +
            escapeHtml(book.number_of_pages) +
            "</span>" +
            "</div>" :
            book.pages ?
            '<div class="meta-item">' +
            '<span class="meta-label">Pages:</span>' +
            '<span class="meta-value">' +
            escapeHtml(book.pages) +
            "</span>" +
            "</div>" :
            "") +
        (book.publish_date ?
            '<div class="meta-item">' +
            '<span class="meta-label">Published:</span>' +
            '<span class="meta-value">' +
            escapeHtml(book.publish_date) +
            "</span>" +
            "</div>" :
            book.published_date || book.published ?
            '<div class="meta-item">' +
            '<span class="meta-label">Published:</span>' +
            '<span class="meta-value">' +
            escapeHtml(book.published_date || book.published) +
            "</span>" +
            "</div>" :
            "") +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="book-description">' +
        '<h2 class="description-title">About the Book</h2>' +
        '<div class="description-text">' +
        escapeHtml(description) +
        "</div>" +
        "</div>" +
        '<div class="actions">' +
        '<a href="index.html" class="btn btn-secondary">Back</a>' +
        "</div>" +
        "</div>";

    content.innerHTML = html;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

// Initialize
window.addEventListener("DOMContentLoaded", loadBookDetails);