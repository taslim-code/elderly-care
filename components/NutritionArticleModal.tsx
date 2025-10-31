import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Article } from '../types';
import { analyzeMealImage, MealAnalysisResult } from '../services/geminiService';
import { CameraIcon, StarIcon } from './icons/Icons';

interface NutritionArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

type ViewState = 'camera' | 'preview' | 'loading' | 'result';

const NutritionArticleModal: React.FC<NutritionArticleModalProps> = ({ isOpen, onClose, article }) => {
  const [viewState, setViewState] = useState<ViewState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Could not access camera. Please check permissions.");
      }
    } else {
      setError("Camera not supported on this device.");
    }
  }, []);

  const resetState = useCallback(() => {
    setViewState('camera');
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (isOpen) {
      resetState();
    } else {
      stopCamera();
    }
    // Cleanup function
    return () => {
      stopCamera();
    };
  }, [isOpen, resetState, stopCamera]);


  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setViewState('preview');
        stopCamera();
      }
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setViewState('loading');
    setError(null);
    try {
      const base64Data = capturedImage.split(',')[1];
      const result = await analyzeMealImage(base64Data);
      setAnalysisResult(result);
      setViewState('result');
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
      setViewState('preview'); // Go back to preview on error
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex justify-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`h-10 w-10 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  if (!isOpen || !article || article.contentType !== 'interactiveNutrition') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-4 transform transition-all animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-md font-semibold text-teal-600">{article.category}</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">AI Meal Analyzer</h2>
            </div>
            <button onClick={onClose} className="bg-gray-100 rounded-full p-2 text-gray-800 hover:bg-gray-200 transition-colors z-10" aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="text-center">
            {viewState === 'camera' && (
              <div>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <button onClick={capturePhoto} className="mt-6 w-full flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors">
                  <CameraIcon className="h-7 w-7 mr-3" /> Capture Photo
                </button>
              </div>
            )}

            {viewState === 'preview' && capturedImage && (
              <div>
                <img src={capturedImage} alt="Captured meal" className="rounded-lg aspect-video object-cover" />
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <div className="mt-6 flex space-x-4">
                  <button onClick={resetState} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300">Retake Photo</button>
                  <button onClick={handleAnalyze} className="flex-1 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700">Analyze Meal</button>
                </div>
              </div>
            )}
            
            {viewState === 'loading' && (
                <div className="h-80 flex flex-col justify-center items-center">
                    <svg className="animate-spin h-12 w-12 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-xl font-semibold text-gray-700">Analyzing your meal...</p>
                </div>
            )}

            {viewState === 'result' && analysisResult && (
              <div>
                 <img src={capturedImage!} alt="Analyzed meal" className="rounded-lg aspect-video object-cover mb-6" />
                 <span className="text-8xl">{analysisResult.isHealthy ? '😊' : '🤔'}</span>
                 <div className="my-4">{renderStars(analysisResult.rating)}</div>
                 <p className="text-xl text-gray-700 bg-gray-50 p-4 rounded-lg">{analysisResult.feedback}</p>

                 {article.mealPlan && (
                    <div className="mt-8 pt-6 border-t text-left">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sample Healthy Meal Plan</h3>
                        <div className="space-y-4 text-lg">
                            <div>
                                <p className="font-semibold text-teal-700 flex items-center"><span className="text-2xl mr-2">🍳</span><span>Breakfast</span></p>
                                <p className="text-gray-600 mt-1 pl-8">{article.mealPlan.breakfast}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-teal-700 flex items-center"><span className="text-2xl mr-2">🥗</span><span>Lunch</span></p>
                                <p className="text-gray-600 mt-1 pl-8">{article.mealPlan.lunch}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-teal-700 flex items-center"><span className="text-2xl mr-2">🍲</span><span>Dinner</span></p>
                                <p className="text-gray-600 mt-1 pl-8">{article.mealPlan.dinner}</p>
                            </div>
                        </div>
                    </div>
                 )}

                 <button onClick={resetState} className="mt-8 w-full bg-teal-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-teal-700">Analyze Another Meal</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes fade-in-up{0%{opacity:0;transform:translateY(20px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}.animate-fade-in-up{animation:fade-in-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default NutritionArticleModal;