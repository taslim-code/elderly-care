
import React, { useState } from 'react';
import { getHealthAdvice } from '../services/geminiService';
import { CpuIcon } from '../components/icons/Icons';

const SymptomCheckerPage: React.FC = () => {
    const [symptoms, setSymptoms] = useState('');
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptoms.trim()) {
            setError('Please describe your symptoms before submitting.');
            return;
        }
        setError('');
        setIsLoading(true);
        setAdvice('');
        try {
            const result = await getHealthAdvice(symptoms);
            setAdvice(result);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">AI Symptom Checker</h2>
                <p className="text-2xl text-gray-500 mt-2">Get AI-powered health information instantly.</p>
            </header>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="symptoms" className="text-2xl font-semibold text-gray-800">
                        Describe your symptoms
                    </label>
                    <p className="text-lg text-gray-500 mt-1 mb-4">For example: "I have a headache and a slight fever for the past two days."</p>
                    <textarea
                        id="symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                        placeholder="Type here..."
                    />
                     {error && <p className="text-red-600 mt-2">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-6 w-full flex items-center justify-center bg-teal-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                           <>
                             <CpuIcon />
                             <span className="ml-3">Get AI Advice</span>
                           </>
                        )}
                    </button>
                </form>

                {advice && (
                    <div className="mt-8 pt-6 border-t-2 border-gray-100">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">AI Health Information</h3>
                        <div className="prose prose-lg max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg whitespace-pre-wrap">
                           {advice.split('**Disclaimer:**').map((part, index) => 
                                index === 1 ? <p key={index}><strong className="text-red-700">Disclaimer:</strong>{part}</p> : <p key={index}>{part}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymptomCheckerPage;
