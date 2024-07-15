import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BookStore from './components/BookStore';
import Footer from './components/Footer';
import axios from 'axios';
import './index.css';
import { FaSearch } from 'react-icons/fa'; // Import the search icon

const App = () => {
  const [bookStores, setBookStores] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  
  useEffect(() => {
    fetchBookStores();
  }, []);

  const fetchBookStores = async () => {
    try {
      const responses = await Promise.all([
        axios.get('https://mock-libra-api.onrender.com/Libra'),
        axios.get('https://mock-bookworm-api.onrender.com/BookWorm'),
        axios.get('https://mock-paperback-api.onrender.com/Paperback'),
        axios.get('https://mock-bibliophile-api.onrender.com/Bibliophile')
      ]);

      const allBooks = responses.flatMap(response => response.data);

      const groupedBooks = groupBooksByStore(allBooks);
      setBookStores(groupedBooks);
    } catch (error) {
      console.error('Error fetching book stores:', error);
    }
  };

  const groupBooksByStore = (books) => {
    const grouped = {};
    books.forEach(book => {
      if (!grouped[book.bookStore]) {
        grouped[book.bookStore] = [];
      }
      grouped[book.bookStore].push(book);
    });
    return Object.keys(grouped).map(storeName => ({ name: storeName, books: grouped[storeName] }));
  };

  const handleSearchInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchInput(inputValue);

    const filteredBooks = bookStores.flatMap(store => store.books)
      .filter((book, index, self) => (
        index === self.findIndex(b => (
          b.bookName === book.bookName && b.author === book.author
        ))
      ))
      .filter(book => {
        const searchTerm = inputValue.trim().toLowerCase();
        return book.bookName.toLowerCase().includes(searchTerm);
      });

    setFilteredBooks(filteredBooks);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    setFilteredBooks([]);
  };

  const findBestDeal = async () => {
    try {
      if (!searchInput.trim()) {
        setErrorMessage('Please enter a book name to search');
        return;
      }

      const bookName = searchInput.split(' by ')[0].trim();

      const response = await axios.get(`http://localhost:8086/bestdeal/book?name=${encodeURIComponent(bookName)}`);

      const { timeStatistics, bestPriceDeal, allDeals } = response.data;

      setBestDeal({ timeStatistics, bestPriceDeal, allDeals });

      setErrorMessage('');
    } catch (error) {
      if (error.response) {
        console.error('Error response from server:', error.response.data);
        setErrorMessage(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setErrorMessage('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
        setErrorMessage('Error setting up request');
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="book-stores">
        {bookStores.slice(0, 3).map((store, index) => (
          <BookStore key={index} name={store.name} books={store.books} />
        ))}
      </div>
      <div className="book-stores">
        {bookStores.slice(3).map((store, index) => (
          <BookStore key={index + 3} name={store.name} books={store.books} />
        ))}
      </div>
      <div className="book-selection">
        <div className="search-input">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search for a book..."
            className="book-dropdown"
          />
          <FaSearch className="search-icon" />
          {searchInput.length > 0 && filteredBooks.length > 0 && (
            <div className="book-suggestions">
              {filteredBooks.map((book, index) => (
                <div key={`${book.bookName}-${book.author}`} className="suggestion-item" onClick={() => handleSuggestionClick(`${book.bookName} by ${book.author}`)}>
                  {book.bookName} by {book.author}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={findBestDeal} className="best-deal-button">Best Deal Price</button>
      </div>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      {bestDeal && (
        <div className="best-deal-table">
          <h2>Best Deal</h2>
          <table>
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Author</th>
                <th>Store</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{bestDeal.bestPriceDeal.bookName}</td>
                <td>{bestDeal.bestPriceDeal.author}</td>
                <td>{bestDeal.bestPriceDeal.bookStore}</td>
                <td>INR {bestDeal.bestPriceDeal.cost}</td>
              </tr>
            </tbody>
          </table>
          <h3>All Deals</h3>
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Book Name</th>
                <th>Author</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {bestDeal.allDeals.map((deal, index) => (
                <tr key={index}>
                  <td>{deal.bookStore}</td>
                  <td>{deal.bookName}</td>
                  <td>{deal.author}</td>
                  <td>INR {deal.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default App;
