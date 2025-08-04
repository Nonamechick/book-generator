import React, { useState, useEffect } from 'react';
import { Faker, en, de, ja } from '@faker-js/faker';
import seedrandom from 'seedrandom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const locales = {
  'en_US': en,
  'de_DE': de,
  'ja_JP': ja,
};

const App = () => {
  const [locale, setLocale] = useState('en_US');
  const [seed, setSeed] = useState(Math.random().toString(36).substring(2, 15));
  const [avgLikes, setAvgLikes] = useState(5);
  const [avgReviews, setAvgReviews] = useState(4.7);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  const generateBooks = () => {
    try {
      
      const currentFaker = new Faker({ locale: locales[locale] });
      
      
      const rng = seedrandom(seed);
      const newBooks = [];
      
      for (let i = 0; i < 10; i++) {
        
        const bookSeed = rng().toString();
        const bookRng = seedrandom(bookSeed);
        
        
        const likesFraction = avgLikes - Math.floor(avgLikes);
        const likes = Math.floor(avgLikes) + (bookRng() < likesFraction ? 1 : 0);
        
        
        const reviewsFraction = avgReviews - Math.floor(avgReviews);
        const reviews = Math.floor(avgReviews) + (bookRng() < reviewsFraction ? 1 : 0);
        
        
        let title;
        try {
          title = currentFaker.book.title();
        } catch (e) {
          
          title = currentFaker.lorem.sentence();
        }
        
        const author = currentFaker.person.fullName();
        
        newBooks.push({
          id: `${seed}-${i}`,
          title,
          author,
          likes,
          reviews,
        });
      }
      
      setBooks(newBooks);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error generating books. Please try again.');
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 15));
  };

  useEffect(() => {
    setBooks([]); 
  }, [locale, seed]);

  
  const formatNumber = (num) => {
    
    if (num < 10000) return num.toString();
    
    
    let str = num.toString();
    
    
    if (str.includes('e')) {
      const [base, exponent] = str.split('e');
      const exp = parseInt(exponent, 10);
      const [intPart, fracPart = ''] = base.split('.');
      let digits = intPart + fracPart;
      const zerosNeeded = exp - (intPart.length - 1);
      
      if (zerosNeeded > 0) {
        digits += '0'.repeat(zerosNeeded);
      }
      
      str = digits;
    }
    
    
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Book Generator</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language/Region</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
            >
              <option value="en_US">English (USA)</option>
              <option value="de_DE">German (Germany)</option>
              <option value="ja_JP">Japanese (Japan)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Seed Value</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <button
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleRandomSeed}
              >
                Random
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Average Likes (0-10)</label>
            <Slider
              className="w-full h-6 mt-2"
              handleStyle={{ width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'pointer' }}
              trackStyle={{ height: '8px', backgroundColor: '#d1d5db', borderRadius: '4px' }}
              min={0}
              max={10}
              step={0.1}
              value={avgLikes}
              onChange={(value) => setAvgLikes(value)}
            />
            <div className="text-center mt-1">{avgLikes.toFixed(1)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Average Reviews</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={avgReviews}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setAvgReviews(value);
                }
              }}
            />
          </div>
        </div>
        <button
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          onClick={generateBooks}
        >
          Generate Books
        </button>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Generated Books</h2>
          {books.length === 0 ? (
            <p className="text-gray-500">No books generated yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {books.map((book) => (
                <div key={book.id} className="border p-4 rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium">{book.title}</h3>
                  <p className="text-gray-600">Author: {book.author}</p>
                  <p className="text-gray-600">Likes: {formatNumber(book.likes)}</p>
                  <p className="text-gray-600">Reviews: {formatNumber(book.reviews)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;