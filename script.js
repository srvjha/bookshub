const booksContainer = document.querySelector('.books-container');
const searchInput = document.getElementById('search');
const sortDropdown = document.getElementById('dropdown');
const viewToggleBtn = document.getElementById('view-toggle');

let books = [];
let page = 1;
let limit = 10;
let query = '';
let viewMode = 'grid';

async function getBookList(page, limit, query) {
    const url = `https://api.freeapi.app/api/v1/public/books?page=${page}&limit=${limit}&inc=kind,id,etag,volumeInfo&query=${query}`;
    const options = {method: 'GET', headers: {accept: 'application/json'}};
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.data.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

function createBookElement(book) {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.innerHTML = `
        <div class="book-image-container">
            <img class="book-image" 
                 src="${book.volumeInfo.imageLinks?.thumbnail || 'placeholder.jpg'}" 
                 alt="${book.volumeInfo.title}">
        </div>
        <div class="book-info">
            <h2 class="book-title">${book.volumeInfo.title}</h2>
            <h3 class="book-authors">${book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</h3>
            <p class="book-publisher">${book.volumeInfo.publisher || 'Unknown Publisher'}</p>
            <p class="book-publish-date">Published: ${book.volumeInfo.publishedDate || 'N/A'}</p>
            <a href="${book.volumeInfo.infoLink}" target="_blank" class="book-details-link">More Details</a>
        </div>
    `;
    return bookItem;
}

async function displayBooks(reset = false) {
    if (reset) {
        booksContainer.innerHTML = '';
        page = 1;
    }

    const newBooks = await getBookList(page, limit, query);
    if (sortDropdown.value === 'atoz') {
        newBooks.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
    } else if (sortDropdown.value === 'date') {
        newBooks.sort((a, b) => {
            const dateA = new Date(a.volumeInfo.publishedDate);
            const dateB = new Date(b.volumeInfo.publishedDate);
            return dateA - dateB;
        });
    }

    booksContainer.className = `books-container ${viewMode}-view`;

    newBooks.forEach(book => {
        const bookElement = createBookElement(book);
        booksContainer.appendChild(bookElement);
    });
}


searchInput.addEventListener('input', (e) => {
    query = e.target.value;
    displayBooks(true);
});


sortDropdown.addEventListener('change', () => {
    displayBooks(true);
});


function toggleView() {
  if (viewMode === 'grid') {
      viewMode = 'list';
      viewToggleBtn.innerHTML = `
          <img src="https://www.svgrepo.com/show/8335/list.svg" width="20px" height="20px" alt="view toggle">
      `;
  } else {
      viewMode = 'grid';
      viewToggleBtn.innerHTML = `
          <img src="https://cdn-icons-png.flaticon.com/512/3603/3603069.png" width="20px" height="20px" alt="view toggle">
      `;
  }
  displayBooks(true);
}


window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        page++;
        displayBooks();
    }
});


displayBooks();