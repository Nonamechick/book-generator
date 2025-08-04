import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Faker, en, de, ja } from '@faker-js/faker';
import seedrandom from 'seedrandom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const locales = {
  'en_US': en,
  'de_DE': de,
  'ja_JP': ja,
};

// Generate a random ISBN
const generateISBN = (faker) => {
  return `978-${faker.number.int({ min: 0, max: 9 })}${faker.number.int({ min: 10000000, max: 99999999 })}`;
};

// Generate random publisher name
const generatePublisher = (faker) => {
  const publishers = [
    "HarperCollins", "Penguin Random House", "Simon & Schuster", "Macmillan", "Hachette",
    "Scholastic", "Wiley", "Springer", "Oxford University Press", "Cambridge University Press"
  ];
  return publishers[Math.floor(Math.random() * publishers.length)];
};

// Generate review text based on locale
const generateReviewText = (faker, locale) => {
  try {
    if (locale === 'ja_JP') {
      const japaneseReviews = [
        "この本は素晴らしいです。物語がとても魅力的でした。",
        "面白い内容でしたが、もう少し展開が速ければ良かったです。",
        "キャラクターの描写が素晴らしく、感情移入できました。",
        "読みやすく、一気に読み終えてしまいました。",
        "期待通りでしたが、もう少し驚きがあれば良かったです。",
        "文章が美しく、情景が目に浮かぶようでした。",
        "テーマが深く、読後も考えさせられる作品でした。",
        "初心者にもおすすめできる一冊です。",
        "専門的な内容ですが、分かりやすく解説されていました。",
        "続きが気になるので、シリーズの次作も楽しみです。"
      ];
      return japaneseReviews[Math.floor(Math.random() * japaneseReviews.length)];
    } else {
      return faker.lorem.paragraph();
    }
  } catch (e) {
    return faker.lorem.sentence();
  }
};

const App = () => {
  const [locale, setLocale] = useState('en_US');
  const [seed, setSeed] = useState(Math.random().toString(36).substring(2, 15));
  const [avgLikes, setAvgLikes] = useState(5);
  const [avgReviews, setAvgReviews] = useState(4.7);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [expandedBookId, setExpandedBookId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const loaderRef = useRef(null);
  
  // Generate a single book with the given parameters
  const generateBook = useCallback((currentFaker, bookSeed, index) => {
    const bookRng = seedrandom(bookSeed);
    
    // Calculate likes with fractional part
    const likesFraction = avgLikes - Math.floor(avgLikes);
    const likes = Math.floor(avgLikes) + (bookRng() < likesFraction ? 1 : 0);
    
    // Calculate reviews with fractional part
    const reviewsFraction = avgReviews - Math.floor(avgReviews);
    const reviews = Math.floor(avgReviews) + (bookRng() < reviewsFraction ? 1 : 0);
    
    // Generate title
    let title;
    try {
      title = currentFaker.book.title();
    } catch (e) {
      title = currentFaker.lorem.sentence();
    }
    
    // Generate author(s)
    const authorCount = Math.floor(bookRng() * 3) + 1; // 1-3 authors
    const authors = [];
    for (let i = 0; i < authorCount; i++) {
      authors.push(currentFaker.person.fullName());
    }
    const authorText = authors.join(', ');
    
    // Generate reviews if any
    const reviewTexts = [];
    for (let i = 0; i < reviews; i++) {
      const reviewRng = seedrandom(`${bookSeed}-review-${i}`);
      reviewTexts.push(generateReviewText(currentFaker, locale));
    }
    
    // Generate book cover image using Faker
    const coverImage = currentFaker.image.url({
      width: 200,
      height: 300,
      category: 'book',
      randomize: true,
      seed: bookSeed
    });
    
    return {
      id: `${seed}-${index}`,
      index: index + 1,
      isbn: generateISBN(currentFaker),
      title,
      author: authorText,
      publisher: generatePublisher(currentFaker),
      likes,
      reviews,
      reviewTexts,
      coverImage
    };
  }, [avgLikes, avgReviews, locale, seed]);
  
  // Generate initial books
  const generateInitialBooks = useCallback(() => {
    try {
      setLoading(true);
      const currentFaker = new Faker({ locale: locales[locale] });
      const rng = seedrandom(seed);
      const newBooks = [];
      
      for (let i = 0; i < 20; i++) {
        const bookSeed = rng().toString();
        newBooks.push(generateBook(currentFaker, bookSeed, i));
      }
      
      setBooks(newBooks);
      setError('');
      setHasMore(true);
    } catch (err) {
      console.error(err);
      setError('Error generating books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [generateBook, locale, seed]);
  
  // Load more books for infinite scrolling
  const loadMoreBooks = useCallback(() => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const currentFaker = new Faker({ locale: locales[locale] });
      const rng = seedrandom(seed);
      
      // Skip the books we already have
      for (let i = 0; i < books.length; i++) {
        rng();
      }
      
      const newBooks = [...books];
      const startIndex = books.length;
      const batchSize = 10;
      
      for (let i = 0; i < batchSize; i++) {
        const bookSeed = rng().toString();
        newBooks.push(generateBook(currentFaker, bookSeed, startIndex + i));
      }
      
      setBooks(newBooks);
      setError('');
      
      // For demo purposes, limit to 100 books
      if (newBooks.length >= 100) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error generating more books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [books, generateBook, hasMore, loading, locale, seed]);
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    };
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreBooks();
      }
    }, options);
    
    if (loaderRef.current) {
      observer.current.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) {
        observer.current.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, loadMoreBooks]);
  
  // Generate initial books when parameters change
  useEffect(() => {
    generateInitialBooks();
  }, [generateInitialBooks]);
  
  const handleRandomSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 15));
  };
  
  const toggleBookDetails = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };
  
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
                onClick={generateInitialBooks}
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                          Index
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                          ISBN
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                          Author(s)
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                          Publisher
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {books.map((book) => (
                        <React.Fragment key={book.id}>
                          <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBookDetails(book.id)}>
                            <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900">
                              {book.index}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                              {book.isbn}
                            </td>
                            <td className="px-6 py-5 text-base font-medium text-gray-900">
                              {book.title}
                            </td>
                            <td className="px-6 py-5 text-base text-gray-500">
                              {book.author}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                              {book.publisher}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-base font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookDetails(book.id);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 text-base"
                              >
                                {expandedBookId === book.id ? 'Hide Details' : 'Show Details'}
                              </button>
                            </td>
                          </tr>
                          {expandedBookId === book.id && (
                            <tr className="bg-gray-50">
                              <td colSpan="6" className="px-6 py-5">
                                <div className="flex flex-col md:flex-row gap-8">
                                  <div className="flex-shrink-0">
                                    <div className="relative">
                                      <img 
                                        src={book.coverImage} 
                                        alt={book.title} 
                                        className="w-40 h-60 object-cover rounded-lg shadow-lg"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex items-end p-3">
                                        <div className="text-white text-sm font-medium truncate w-full">
                                          {book.title}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">{book.title}</h3>
                                    <p className="text-lg text-gray-600 mb-2">by {book.author}</p>
                                    <p className="text-lg text-gray-600 mb-2">Publisher: {book.publisher}</p>
                                    <p className="text-lg text-gray-600 mb-2">ISBN: {book.isbn}</p>
                                    
                                    <div className="flex items-center mt-4 mb-4">
                                      <div className="bg-indigo-100 text-indigo-800 py-2 px-4 rounded-full text-base font-medium mr-4">
                                        {formatNumber(book.likes)} {book.likes === 1 ? 'Like' : 'Likes'}
                                      </div>
                                      <div className="bg-green-100 text-green-800 py-2 px-4 rounded-full text-base font-medium">
                                        {formatNumber(book.reviews)} {book.reviews === 1 ? 'Review' : 'Reviews'}
                                      </div>
                                    </div>
                                    
                                    {book.reviews > 0 && (
                                      <div>
                                        <h4 className="text-lg font-medium text-gray-700 mb-3">Reviews:</h4>
                                        <div className="space-y-3">
                                          {book.reviewTexts.map((review, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                              <p className="text-base text-gray-700">{review}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  
                  {hasMore && (
                    <div ref={loaderRef} className="flex justify-center py-6">
                      {loading && (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-indigo-600 text-lg">Loading more books...</span>
                        </div>
                      )}
                    </div>
                  )}
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