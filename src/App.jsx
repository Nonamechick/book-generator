import React, { useState, useEffect, useCallback } from 'react';
import { Faker, en, de, ja } from '@faker-js/faker';
import seedrandom from 'seedrandom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import InfiniteScroll from 'react-infinite-scroll-component';

const locales = {
  'en_US': en,
  'de_DE': de,
  'ja_JP': ja,
};

const generateISBN = (faker) => {
  return `978-${faker.number.int({ min: 0, max: 9 })}${faker.number.int({ min: 10000000, max: 99999999 })}`;
};

const generatePublisher = (faker) => {
  const publishers = [
    "HarperCollins", "Penguin Random House", "Simon & Schuster", "Macmillan", "Hachette",
    "Scholastic", "Wiley", "Springer", "Oxford University Press", "Cambridge University Press"
  ];
  return publishers[Math.floor(Math.random() * publishers.length)];
};

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
  const [page, setPage] = useState(0);

  const generateBook = useCallback((currentFaker, bookIndex) => {
    const bookSeed = `${seed}-${bookIndex}`;
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

    const authorCount = Math.floor(bookRng() * 3) + 1;
    const authors = [];
    for (let i = 0; i < authorCount; i++) {
      authors.push(currentFaker.person.fullName());
    }

    const reviewTexts = [];
    for (let i = 0; i < reviews; i++) {
      reviewTexts.push(generateReviewText(currentFaker, locale));
    }

    return {
      id: bookSeed,
      index: bookIndex + 1,
      isbn: generateISBN(currentFaker),
      title,
      author: authors.join(', '),
      publisher: generatePublisher(currentFaker),
      likes,
      reviews,
      reviewTexts,
      coverImage: currentFaker.image.url({ width: 200, height: 300 })
    };
  }, [avgLikes, avgReviews, locale, seed]);

  const generateInitialBooks = useCallback(() => {
    try {
      setLoading(true);
      const currentFaker = new Faker({ locale: locales[locale] });
      const newBooks = [];
      for (let i = 0; i < 20; i++) {
        newBooks.push(generateBook(currentFaker, i));
      }
      setBooks(newBooks);
      setPage(1);
      setError('');
    } catch (err) {
      setError('Error generating books.');
    } finally {
      setLoading(false);
    }
  }, [generateBook, locale]);

  const fetchMoreData = useCallback(() => {
    if (loading) return;
    try {
      setLoading(true);
      const currentFaker = new Faker({ locale: locales[locale] });
      const startIndex = page * 20;
      const batchSize = 10;
      const newBooks = [...books];
      for (let i = 0; i < batchSize; i++) {
        newBooks.push(generateBook(currentFaker, startIndex + i));
      }
      setBooks(newBooks);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError('Error loading more books.');
    } finally {
      setLoading(false);
    }
  }, [books, generateBook, locale, loading, page]);

  useEffect(() => {
    generateInitialBooks();
  }, [generateInitialBooks]);

  const toggleBookDetails = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const formatNumber = (num) => {
    if (num < 10000) return num.toString();
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-full mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Book Store Test Data Generator</h1>
          <p className="text-lg text-gray-600">Generate realistic fake book information for testing purposes</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Generator Settings</h2>

              {error && <div className="text-red-500 mb-4">{error}</div>}

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Language & Region</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(locales).map(([code]) => (
                    <div
                      key={code}
                      onClick={() => setLocale(code)}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        locale === code ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                        locale === code ? 'border-indigo-500' : 'border-gray-400'
                      }`}>
                        {locale === code && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
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

              {/* Seed Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Seed Value</label>
                <div className="flex">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSeed(Math.random().toString(36).substring(2, 15))}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-lg"
                  >
                    Random
                  </button>
                </div>
              </div>

              {/* Likes Slider */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Average Likes per Book: <span className="text-indigo-600 font-bold">{avgLikes.toFixed(1)}</span>
                </label>
                <Slider
                  min={0}
                  max={10}
                  step={0.1}
                  value={avgLikes}
                  onChange={(val) => setAvgLikes(val)}
                />
              </div>

              {/* Reviews Input */}
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">Average Reviews per Book</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={avgReviews}
                  onChange={(e) => setAvgReviews(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                onClick={generateInitialBooks}
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Generate Books
              </button>
            </div>
          </div>

          {/* Books Table Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
              <div className="bg-indigo-700 text-white py-4 px-6">
                <h2 className="text-xl font-bold">Generated Books</h2>
              </div>

              {books.length === 0 ? (
                <div className="flex-grow flex items-center justify-center p-8 text-gray-500">
                  No books generated yet.
                </div>
              ) : (
                <div id="table-container" className="flex-grow overflow-auto">
                  <InfiniteScroll
                    dataLength={books.length}
                    next={fetchMoreData}
                    hasMore={true}
                    loader={
                      <div className="flex justify-center py-4 text-indigo-600 font-medium">
                        Loading more books...
                      </div>
                    }
                    scrollableTarget="table-container"
                  >
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Index</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author(s)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {books.map((book) => (
                          <React.Fragment key={book.id}>
                            <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleBookDetails(book.id)}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.index}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.isbn}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">{book.title}</td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{book.author}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.publisher}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookDetails(book.id);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {expandedBookId === book.id ? 'Hide Details' : 'Show Details'}
                                </button>
                              </td>
                            </tr>
                            {expandedBookId === book.id && (
                              <tr className="bg-gray-50">
                                <td colSpan="6" className="px-6 py-4">
                                  <div className="flex flex-col md:flex-row gap-6">
                                    <img src={book.coverImage} alt={book.title} className="w-48 h-64 object-cover rounded-md" />
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
                                      <p className="text-gray-600 mb-1">by {book.author}</p>
                                      <p className="text-gray-600 mb-1">Publisher: {book.publisher}</p>
                                      <p className="text-gray-600 mb-1">ISBN: {book.isbn}</p>
                                      <div className="flex space-x-4 mt-2">
                                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                          {formatNumber(book.likes)} Likes
                                        </span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                          {formatNumber(book.reviews)} Reviews
                                        </span>
                                      </div>
                                      <div className="mt-4 space-y-2">
                                        {book.reviewTexts.map((review, i) => (
                                          <div key={i} className="bg-white p-3 rounded-md border border-gray-200 text-sm text-gray-700">
                                            {review}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </InfiniteScroll>
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