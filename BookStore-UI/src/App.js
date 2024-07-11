import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BookStore from './components/BookStore';
import Footer from './components/Footer';
import axios from 'axios';

import './index.css'; // Import the CSS file for styling

const App = () => {
  const [bookStores, setBookStores] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedType, setSelectedType] = useState(''); // Initialize with empty string
  const [bestDeal, setBestDeal] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchBookStores();
  }, []);

  const fetchBookStores = async () => {
    try {
      const responses = await Promise.all([
        axios.get('https://7cf6495c-0e1d-45a7-9c82-1387408c7f3b.mock.pstmn.io/store/book'),
        axios.get('https://e5646159-afea-46da-a5a7-ff5759f70858.mock.pstmn.io/store/book'),
        axios.get('https://d94374a3-e1b3-464d-b609-ed7e45a732fa.mock.pstmn.io/store/book'),
        axios.get('https://6410a146-4160-4128-9806-b7f5329077b5.mock.pstmn.io/store/book')
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

  const handleBookChange = (event) => {
    setSelectedBook(event.target.value);
    setErrorMessage(''); // Clear error message when a book is selected
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setErrorMessage(''); // Clear error message when a type is selected
  };

  const findBestDeal = async () => {
    try {
      if (!selectedBook || !selectedType) { // Check if book and type are selected
        setErrorMessage('Please select a book and a model');
        return;
      }
  
      const response = await axios.get(`http://localhost:8086/virtualstore/book?name=${encodeURIComponent(selectedBook)}&model=${selectedType}`);
  
      // Extract timeStatistics, bestPriceDeal, and allDeals from the response
      const { timeStatistics, bestPriceDeal, allDeals } = response.data;
  
      // Set the best deal including time statistics
      setBestDeal({ timeStatistics, bestPriceDeal, allDeals });
  
      setErrorMessage(''); // Clear error message on successful fetch
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
        {bookStores.map((store, index) => (
          <BookStore key={index} name={store.name} books={store.books} />
        ))}
      </div>
      <div className="book-selection">
        <select value={selectedBook} onChange={handleBookChange} className="book-dropdown">
          <option value="">Select a book...</option>
          {bookStores.flatMap(store => store.books).map((book, index) => (
            <option key={index} value={book.bookName}>{book.bookName} by {book.author}</option>
          ))}
        </select>
        <select value={selectedType} onChange={handleTypeChange} className="type-dropdown">
          <option value="">Select a model...</option>
          <option value="virtual">Virtual</option>
          <option value="traditional">Traditional</option>
        </select>
        <button onClick={findBestDeal} className="best-deal-button">Best Deal Price</button>
      </div>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      {bestDeal && (
        <div className="popup-container">
          <h2>Best Deal</h2>
          <p>Book Name: {bestDeal.bestPriceDeal.bookName}</p>
          <p>Author: {bestDeal.bestPriceDeal.author}</p>
          <p>Store: {bestDeal.bestPriceDeal.bookStore}</p>
          <p>Price: INR {bestDeal.bestPriceDeal.cost}</p>
          <h3>All Deals</h3>
          {bestDeal.allDeals.map((deal, index) => (
            <div key={index}>
              <p>Store: {deal.bookStore}</p>
              <p>Book Name: {deal.bookName}</p>
              <p>Author: {deal.author}</p>
              <p>Price: INR {deal.cost}</p>
            </div>
          ))}
          {/* Display time statistics */}
          {bestDeal.timeStatistics && (
            <div>
              <h3>Time Statistics</h3>
              <ul>
                {Object.entries(bestDeal.timeStatistics.timeMap).map(([store, time]) => (
                  <li key={store}>{store}: {time}ms</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default App;
