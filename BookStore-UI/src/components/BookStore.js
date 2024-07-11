// BookStore.js
import React, { useState } from 'react';
import BookList from './BookList';

const BookStore = ({ name, books }) => {
  const [showBooks, setShowBooks] = useState(false);

  const toggleBooks = () => {
    setShowBooks(!showBooks);
  };

  // Extract unique books by bookName
  const uniqueBooks = Array.from(new Set(books.map(book => book.bookName)))
    .map(bookName => {
      return books.find(book => book.bookName === bookName);
    });

  return (
    <div className="book-store">
      <h2 onClick={toggleBooks}>{name}</h2>
      {showBooks && <BookList books={uniqueBooks} />}
    </div>
  );
};

export default BookStore;
