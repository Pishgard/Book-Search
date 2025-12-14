# Book Search - BigBook API

A modern, responsive web application for searching and viewing book details using the BigBook API.

## Features

- 🔍 Search books by title or topic
- 📚 View detailed book information
- 🎨 Modern, clean UI with dark theme
- 📱 Fully responsive design
- ⚡ Fast and efficient API integration

## Project Structure

```
Book List/
├── index.html              # Main search page
├── details.html            # Book details page
├── assets/
│   ├── css/
│   │   ├── styles.css      # Main page styles
│   │   └── details.css      # Details page styles
│   └── js/
│       ├── app.js          # Main page logic
│       └── details.js      # Details page logic
└── README.md               # This file
```

## Setup

1. Open `index.html` in a web browser
2. The API key is already configured in `assets/js/app.js`
3. Start searching for books!

## API Configuration

The API key is set in `assets/js/app.js`:
```javascript
const API_KEY = "your-api-key-here";
```

To get your own API key, visit [BigBook API](https://bigbookapi.com)

## Usage

1. Enter a book title or topic in the search box
2. Click "Search" or press Enter
3. Browse the results
4. Click on any book card to view detailed information

## Technologies

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- BigBook API

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal use.

