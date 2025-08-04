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
          reviews
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Book Store Test Data Generator</h1>
          <p className="text-lg text-gray-600">Generate realistic fake book information for testing purposes</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Generator Settings</h2>
              
              {error && <div className="text-red-500 mb-4">{error}</div>}
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Language & Region</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(locales).map(([code, localeData]) => (
                    <div 
                      key={code}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        locale === code 
                          ? 'bg-indigo-50 border-indigo-500' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setLocale(code)}
                    >
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                        locale === code ? 'border-indigo-500' : 'border-gray-400'
                      }`}>
                        {locale === code && (
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{code.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">
                          {code === 'en_US' ? 'English (USA)' : 
                           code === 'de_DE' ? 'German (Germany)' : 
                           'Japanese (Japan)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Seed Value</label>
                <div className="flex">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter seed value"
                  />
                  <button
                    type="button"
                    onClick={handleRandomSeed}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-lg transition-colors"
                  >
                    Random
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Same seed will always generate the same books
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Average Likes per Book: <span className="text-indigo-600 font-bold">{avgLikes.toFixed(1)}</span>
                </label>
                <Slider
                  min={0}
                  max={10}
                  step={0.1}
                  value={avgLikes}
                  onChange={(value) => setAvgLikes(value)}
                  className="mb-2"
                  handleStyle={{ width: '24px', height: '24px', backgroundColor: '#4f46e5', borderRadius: '50%', cursor: 'pointer' }}
                  trackStyle={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">
                  Average Reviews per Book
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={avgReviews}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setAvgReviews(value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={generateBooks}
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Generate Books
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-indigo-700 text-white py-4 px-6">
                <h2 className="text-xl font-bold">Generated Books</h2>
              </div>
              
              {books.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-indigo-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Books Generated Yet</h3>
                  <p className="text-gray-500">Configure the settings and click "Generate Books" to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {books.map((book, index) => (
                    <div key={book.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{book.title}</h3>
                          <p className="text-gray-600">by {book.author}</p>
                        </div>
                        <div className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-medium">
                          {formatNumber(book.likes)} {book.likes === 1 ? 'Like' : 'Likes'}
                        </div>
                      </div>
                      
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-indigo-800 font-medium">
                            {formatNumber(book.reviews)} {book.reviews === 1 ? 'Review' : 'Reviews'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;