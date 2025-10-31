import React from 'react';
import type { Article } from '../types';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-4 transform transition-all animate-fade-in-up overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="relative">
            <img src={article.imageUrl} alt={article.title} className="h-64 w-full object-cover" />
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white bg-opacity-70 rounded-full p-2 text-gray-800 hover:bg-opacity-100 transition-colors"
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-8">
            <p className="text-md font-semibold text-teal-600">{article.category}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{article.title}</h3>

            {/* Conditional content for different article types */}
            {article.contentType === 'religious' && article.religiousBooks ? (
                <div className="my-6 space-y-5 max-h-[40vh] overflow-y-auto pr-4">
                    {article.religiousBooks.map((book, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-800">{book.title}</h4>
                            <p className="text-md font-semibold text-gray-600 italic mt-1">{book.author}</p>
                            <p className="text-lg text-gray-700 mt-2">{book.summary}</p>
                            {book.youtubeUrl && (
                                <a
                                    href={book.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center bg-red-100 text-red-800 font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Listen on YouTube
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <p className="text-lg text-gray-600 my-6">{article.fullDescription}</p>
                    {article.youtubeUrl && (
                        <a
                            href={article.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Watch on YouTube
                        </a>
                    )}
                </>
            )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ArticleModal;