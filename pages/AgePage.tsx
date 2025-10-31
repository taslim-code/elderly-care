import React, { useState } from 'react';

interface AgePageProps {
  userName: string;
  onComplete: (age: number) => void;
  onBack: () => void;
}

const AgePage: React.FC<AgePageProps> = ({ userName, onComplete, onBack }) => {
  const [age, setAge] = useState(30);

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Welcome, {userName.split(' ')[0]}!</h2>
      <p className="text-center text-gray-500 mb-8">Please select your age.</p>

      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="text-8xl font-bold text-teal-600 mb-8 transition-all duration-300 transform scale-100 hover:scale-110">
          {age}
        </div>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value={age} 
          onChange={(e) => setAge(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-teal-600"
        />
        <div className="w-full flex justify-between text-sm text-gray-500 px-1 mt-2">
            <span>1</span>
            <span>100</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col space-y-3">
        <button 
            onClick={() => onComplete(age)} 
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-teal-700 transition-transform transform hover:scale-105"
        >
          Complete Registration
        </button>
         <button 
            onClick={onBack} 
            className="w-full text-center text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-100"
        >
          &larr; Go Back
        </button>
      </div>
    </div>
  );
};

export default AgePage;