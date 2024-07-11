import React from 'react';

const BookList = ({ books }) => {
  return (
    <ul>
      {books.map((book, index) => (
        <li key={index}>
          {book.bookName} by {book.author} - INR {book.cost}
        </li>
      ))}
    </ul>
  );
};

export default BookList;
