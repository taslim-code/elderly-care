import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DiaryMessage, Mood } from '../types';
import { getDiaryResponse } from '../services/geminiService';
import { LockClosedIcon, TrashIcon, StarIcon, MicrophoneIcon, PauseIcon, SparklesIcon, PaperAirplaneIcon } from '../components/icons/Icons';

interface WellnessPageProps {
  userId: string;
}

const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  'en-US': 'English',
  'hi-IN': 'हिन्दी',
};

const INITIAL_GREETINGS: { [key: string]: string } = {
    'en-US': "Hello, this is your private diary, Echo. You can share anything on your mind by typing or by tapping the microphone to speak. Your thoughts are safe here.",
    'hi-IN': "नमस्ते, यह आपकी निजी डायरी, 'इको' है। आप अपने मन की कोई भी बात टाइप करके या माइक्रोफ़ोन पर बोलकर साझा कर सकते हैं। आपके विचार यहाँ सुरक्षित हैं।",
};

// SpeechRecognition might not be on the window object in all browsers
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.lang = 'en-US'; // Default, will be updated dynamically
    recognition.interimResults = true;
}

const moods: { name: Mood; emoji: string; defaultRating: number; }[] = [
    { name: 'Happy', emoji: '😊', defaultRating: 5 },
    { name: 'Calm', emoji: '😌', defaultRating: 4 },
    { name: 'Neutral', emoji: '😐', defaultRating: 3 },
    { name: 'Sad', emoji: '😔', defaultRating: 2 },
    { name: 'Stressed', emoji: '😩', defaultRating: 1 },
];

const StarRating: React.FC<{ rating: number; setRating?: (rating: number) => void; className?: string }> = ({ rating, setRating, className = "h-8 w-8" }) => (
    <div className="flex justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
            <button key={i} type="button" onClick={() => setRating && setRating(i + 1)} disabled={!setRating} className={setRating ? 'cursor-pointer' : ''}>
                <StarIcon className={`${className} transition-colors ${i < rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} />
            </button>
        ))}
    </div>
);

const WellnessPage: React.FC<WellnessPageProps> = ({ userId }) => {
    const JOURNAL_STORAGE_KEY = `elderlyease_journal_${userId}`;

    const [messages, setMessages] = useState<DiaryMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [rating, setRating] = useState(0);
    const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [isAvailable, setIsAvailable] = useState(!!recognition);
    const [language, setLanguage] = useState('en-US');
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const finalTranscriptRef = useRef('');

    // Load messages from local storage on initial render
    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(JOURNAL_STORAGE_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                 setMessages([
                    {
                        id: 'init-1',
                        sender: 'ai',
                        text: INITIAL_GREETINGS[language],
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                ]);
            }
        } catch (error) {
            console.error("Failed to load journal from local storage", error);
        }
    }, [language, JOURNAL_STORAGE_KEY]);

    // Save messages to local storage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save journal to local storage", error);
        }
    }, [messages, JOURNAL_STORAGE_KEY]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, assistantState]);
    
    const speak = useCallback((text: string, onEndCallback?: () => void) => {
        window.speechSynthesis.cancel();
        setAssistantState('speaking');
        setErrorMessage(null); // Clear previous errors

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        
        utterance.onend = () => {
            setAssistantState('idle');
            if (onEndCallback) onEndCallback();
        };
        
        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
            if (event.error === 'canceled' || event.error === 'interrupted') {
                // Not a critical error, can be ignored.
                setAssistantState('idle');
                if (onEndCallback) onEndCallback();
                return;
            }

            console.error('SpeechSynthesisUtterance.onerror:', event.error, event);

            let errorText: string;
            const langName = SUPPORTED_LANGUAGES[language] || 'the selected language';

            switch (event.error) {
                case 'network':
                    errorText = "I couldn't speak due to a network issue. Please check your connection.";
                    break;
                case 'language-unavailable':
                    errorText = `Sorry, I can't speak ${langName} on this device.`;
                    break;
                case 'synthesis-failed':
                    errorText = "Sorry, my voice failed to start. Please try again in a moment.";
                    break;
                case 'audio-busy':
                    errorText = "My voice is busy at the moment. Please wait and try again.";
                    break;
                case 'audio-hardware':
                case 'synthesis-unavailable':
                case 'voice-unavailable':
                case 'text-too-long':
                case 'invalid-argument':
                default:
                    errorText = "An unexpected voice error occurred. Please try again.";
                    break;
            }
            
            setErrorMessage(errorText);
            setAssistantState('idle');
            if (onEndCallback) onEndCallback();
        };
        
        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Error calling window.speechSynthesis.speak:", e);
            setErrorMessage("An unexpected error occurred with the voice feature.");
            setAssistantState('idle');
            if (onEndCallback) onEndCallback();
        }
    }, [language]);

    const handleSendMessage = useCallback(async (text: string, mood?: Mood, ratingValue?: number) => {
        if (!text.trim() || assistantState === 'processing') return;

        const newUserMessage: DiaryMessage = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mood: mood || undefined,
            rating: ratingValue || undefined,
        };

        const currentHistory = [...messages, newUserMessage];
        setMessages(currentHistory);
        setAssistantState('processing');

        try {
            const aiResponseText = await getDiaryResponse(currentHistory, language);
            const newAiMessage: DiaryMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: aiResponseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, newAiMessage]);
            speak(aiResponseText);
        } catch (error) {
            console.error("Error getting diary response:", error);
            const errorAiMessage: DiaryMessage = {
                id: `msg-err-${Date.now()}`,
                sender: 'ai',
                text: "I'm sorry, I'm having a little trouble thinking right now.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorAiMessage]);
            setAssistantState('idle');
        }
    }, [assistantState, messages, speak, language]);

     useEffect(() => {
        if (!recognition) return;

        recognition.onstart = () => setAssistantState('listening');
        recognition.onend = () => {
            if (assistantState === 'listening') {
                setAssistantState('idle');
                const finalTranscript = finalTranscriptRef.current.trim();
                if (finalTranscript) {
                    handleSendMessage(finalTranscript, selectedMood || undefined, rating || undefined);
                    setUserInput('');
                    setSelectedMood(null);
                    setRating(0);
                }
            }
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
             if(event.error === 'not-allowed') {
                alert("Voice input is disabled. Please enable microphone permissions in your browser settings to use this feature.");
                setIsAvailable(false);
            }
            setAssistantState('idle');
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            finalTranscriptRef.current = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setUserInput(finalTranscriptRef.current + interimTranscript);
        };
     }, [assistantState, handleSendMessage, rating, selectedMood]);

    const handleMicClick = () => {
        if (!isAvailable) return;
        
        switch (assistantState) {
            case 'idle':
                finalTranscriptRef.current = '';
                setUserInput('');
                if (recognition) {
                    recognition.lang = language;
                    recognition.start();
                }
                break;
            case 'listening':
                recognition?.stop();
                break;
            case 'speaking':
                window.speechSynthesis.cancel();
                setAssistantState('idle');
                break;
            case 'processing':
                // Do nothing
                break;
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput, selectedMood || undefined, rating || undefined);
        setUserInput('');
        setSelectedMood(null);
        setRating(0);
    }
    
    const handleClearDiary = () => {
        if (window.confirm('Are you sure you want to permanently delete all diary entries? This action cannot be undone.')) {
            setMessages([
                {
                    id: 'init-1',
                    sender: 'ai',
                    text: INITIAL_GREETINGS[language],
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        }
    };

    const handleMoodSelect = (mood: Mood, defaultRating: number) => {
        if (selectedMood === mood) {
            setSelectedMood(null);
            setRating(0);
        } else {
            setSelectedMood(mood);
            setRating(defaultRating);
        }
    };

    const getMicButtonIcon = () => {
        switch (assistantState) {
            case 'listening': return <div className="relative h-10 w-10"><MicrophoneIcon /><span className="absolute inset-0 h-full w-full rounded-full bg-red-500 animate-ping opacity-75"></span></div>;
            case 'processing': return <SparklesIcon className="h-10 w-10 animate-pulse" />;
            case 'speaking': return <PauseIcon className="h-10 w-10" />;
            case 'idle':
            default: return <MicrophoneIcon className="h-10 w-10" />;
        }
    };
    
    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-64px)]">
             <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-5xl font-bold text-gray-800">Echo Journal</h2>
                    <p className="text-2xl text-gray-500 mt-2">Your private, voice-powered diary.</p>
                </div>
                <button
                    onClick={handleClearDiary}
                    className="flex items-center bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg text-md hover:bg-red-200 transition-colors"
                    title="Clear all entries"
                >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Clear Diary
                </button>
            </header>

            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    <div className="flex flex-col space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex items-end space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && (
                                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">E</div>
                                )}
                                <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                    {msg.mood && msg.rating !== undefined && (
                                        <div className="mb-3 pb-3 border-b border-white/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-3xl mr-2">{moods.find(m => m.name === msg.mood)?.emoji}</span>
                                                    <span className="font-bold text-lg">{msg.mood}</span>
                                                </div>
                                                <StarRating rating={msg.rating} className="h-5 w-5" />
                                            </div>
                                        </div>
                                    )}
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'} text-right`}>{msg.timestamp}</p>
                                </div>
                            </div>
                        ))}
                        {assistantState === 'processing' && (
                             <div className="flex items-end space-x-3 justify-start">
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">E</div>
                                <div className="max-w-xl p-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                         <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                        <LockClosedIcon className="h-3 w-3 mr-1" />
                        <span>Your entries are saved on this device and are not shared.</span>
                    </div>

                    {errorMessage && (
                        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold animate-fade-in-up-fast">
                            {errorMessage}
                        </div>
                    )}

                    <div className="mb-3">
                        <div className="flex justify-center p-2 bg-gray-50 rounded-lg">
                            {moods.map(mood => (
                                <button key={mood.name} type="button" onClick={() => handleMoodSelect(mood.name, mood.defaultRating)} className={`flex-1 flex flex-col items-center group p-2 rounded-lg transition-all ${selectedMood === mood.name ? 'bg-teal-100' : ''}`}>
                                    <span className={`text-3xl group-hover:scale-110 transition-transform ${selectedMood === mood.name ? 'scale-110' : ''}`}>{mood.emoji}</span>
                                    <span className="mt-1 text-xs font-semibold text-gray-600">{mood.name}</span>
                                </button>
                            ))}
                        </div>
                         {selectedMood && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                <StarRating rating={rating} setRating={setRating} className="h-6 w-6" />
                            </div>
                         )}
                    </div>

                    <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
                        <div className="relative flex-1">
                            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={language === 'hi-IN' ? "बोलने के लिए टाइप करें या माइक का उपयोग करें..." : "Type or use the mic to talk..."} className="w-full bg-gray-100 border-2 border-transparent focus:border-teal-500 rounded-full px-5 py-3 text-lg focus:outline-none" disabled={assistantState !== 'idle'}/>
                             <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <button
                                    type="button"
                                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                                    className="h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 text-teal-600 font-bold text-sm flex items-center justify-center transition-transform"
                                    aria-label="Change language"
                                >
                                    {language.split('-')[0].toUpperCase()}
                                </button>
                                {isLanguageMenuOpen && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-1 flex flex-col gap-1 w-32">
                                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                                            <button
                                                key={code}
                                                type="button"
                                                onClick={() => {
                                                    setLanguage(code);
                                                    setIsLanguageMenuOpen(false);
                                                }}
                                                className={`px-3 py-2 text-md w-full text-left rounded font-semibold transition-colors ${
                                                    language === code ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleMicClick} 
                            disabled={!isAvailable}
                            className={`p-3 rounded-full text-white transition-colors duration-200 flex items-center justify-center w-16 h-16 ${
                                assistantState === 'listening' ? 'bg-red-500' : 'bg-teal-600'
                            } ${assistantState === 'processing' ? 'bg-blue-500 animate-pulse' : ''} ${
                                assistantState === 'speaking' ? 'bg-purple-500' : ''
                            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                            title={!isAvailable ? "Voice input not supported on this browser" : "Talk to Echo"}
                         >
                            {getMicButtonIcon()}
                         </button>
                        <button type="submit" disabled={assistantState !== 'idle' || !userInput.trim()} className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors disabled:bg-gray-300">
                            <PaperAirplaneIcon className="h-7 w-7"/>
                        </button>
                    </form>
                </div>
            </div>
             <style>{`
                 @keyframes fade-in-up-fast {
                  0% {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .animate-fade-in-up-fast {
                  animation: fade-in-up-fast 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default WellnessPage;