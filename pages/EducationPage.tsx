import React, { useState } from 'react';
import { ARTICLES } from '../constants';
import { View, type Article } from '../types';
import ArticleModal from '../components/ArticleModal';
import NutritionArticleModal from '../components/NutritionArticleModal';
import { SparklesIcon } from '../components/icons/Icons';

interface EducationPageProps {
  setActiveView: (view: View) => void;
}

const EducationPage: React.FC<EducationPageProps> = ({ setActiveView }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleReadMore = (article: Article) => {
    if (article.navigateToView) {
      setActiveView(article.navigateToView);
    } else {
      setSelectedArticle(article);
    }
  };

  const closeModal = () => {
    setSelectedArticle(null);
  };
  
  const wellnessTitles = ['Nurturing Your Mental Wellness', 'Spiritual Wellness'];
  
  // Extract unique categories for filtering
  const categories = ['All', ...Array.from(new Set(ARTICLES.map(a => a.category)))];
  
  const filteredArticles = ARTICLES.filter(article => 
    activeFilter === 'All' || article.category === activeFilter
  );

  return (
    <div className="animate-fade-in">
      <header className="mb-10 text-center">
        <h2 className="text-5xl font-bold text-gray-800">Health Education Library</h2>
        <p className="text-2xl text-gray-500 mt-2">Knowledge to help you live a healthier, happier life.</p>
      </header>
      
      {/* Filter Buttons */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-6 py-2 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
              activeFilter === category
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map(article => {
          const isWellness = wellnessTitles.includes(article.title);
          return (
            <div 
              key={article.id} 
              className={`bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${isWellness ? 'border-2 border-teal-400' : ''}`}
            >
              <div className="relative">
                <img src={article.imageUrl} alt={article.title} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                {isWellness && (
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-teal-500 shadow-md">
                        <SparklesIcon className="h-6 w-6" />
                    </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-md font-semibold text-teal-600 tracking-wider uppercase">{article.category}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2 flex-grow">{article.title}</h3>
                
                {article.contentType === 'interactiveNutrition' && article.quickTips ? (
                  <div className="mt-3 space-y-2 text-md text-gray-600">
                    {article.quickTips.slice(0, 2).map((tip, index) => (
                      <p key={index} className="flex items-start"><span className="mr-2 pt-1">💡</span><span>{tip}</span></p>
                    ))}
                  </div>
                ) : (
                  <p className="text-md text-gray-600 mt-3">{article.summary}</p>
                )}

                <button 
                  onClick={() => handleReadMore(article)}
                  className="mt-6 w-full bg-teal-50 text-teal-700 font-bold py-3 px-4 rounded-lg hover:bg-teal-100 transition-colors duration-300 self-end"
                >
                  {article.contentType === 'interactiveNutrition' ? 'Analyze Meal' : 'Learn More'}
                </button>
              </div>
            </div>
          )
        })}
         {filteredArticles.length === 0 && (
          <div className="text-center py-20 col-span-full">
            <p className="text-2xl font-semibold text-gray-500">No articles found.</p>
            <p className="text-lg text-gray-400 mt-2">Try selecting another category.</p>
          </div>
        )}
      </div>
      
      <ArticleModal 
        isOpen={!!selectedArticle && (selectedArticle.contentType === 'standard' || selectedArticle.contentType === 'religious' || !selectedArticle.contentType)}
        onClose={closeModal}
        article={selectedArticle}
      />
      <NutritionArticleModal
        isOpen={!!selectedArticle && selectedArticle.contentType === 'interactiveNutrition'}
        onClose={closeModal}
        article={selectedArticle}
      />
      <style>{`
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default EducationPage;
