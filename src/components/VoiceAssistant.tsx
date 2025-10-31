

import React, { useState, useEffect } from 'react';
import { getVoiceCommandAction } from '../services/geminiService';
import { View, DoctorView, Reminder, VoiceAction } from '../types';
import { MicrophoneIcon, SparklesIcon } from './icons/Icons';

// New: Language definitions
const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  'en-US': 'English',
  'hi-IN': 'हिन्दी',
  'ta-IN': 'தமிழ்',
};

const LOCALIZED_RESPONSES = {
    'en-US': {
        navigate: (view: string) => [ `Sure, going to ${view} now.`, `Okay, opening the ${view} page.`, `Here is the ${view} section.`],
        call_sos: () => [ "Activating SOS now.", "Emergency alert triggered. Help is on the way.", "Contacting emergency services for you." ],
        read_reminders: (remindersText: string) => [ `You have a few reminders coming up: ${remindersText}.`, `Here are your next reminders: ${remindersText}.`, `Okay, your upcoming reminders are: ${remindersText}.` ],
        no_reminders: () => ["You have no upcoming reminders."],
        sos_unavailable: () => ["The SOS feature is only available for patients."],
        reminders_unavailable: () => ["You can view patient reminders from the schedule or patient records page."],
        no_speech: () => ["I didn't hear anything. Please try again.", "Sorry, I couldn't hear you. Can you speak up?", "I missed that. Could you say it again?"],
        speech_error: () => ["Sorry, my voice isn't working right now. Please try again in a bit."],
        network_error: () => ["I can't seem to connect. Please check your internet connection."]
    },
    'hi-IN': {
        navigate: (view: string) => [ `ज़रूर, ${view} पर जा रहे हैं।`, `ठीक है, ${view} पेज खोल रहे हैं।`, `यह रहा ${view} सेक्शन।` ],
        call_sos: () => [ "अभी एसओएस सक्रिय किया जा रहा है।", "आपातकालीन चेतावनी चालू हो गई है। मदद रास्ते में है।", "आपके लिए आपातकालीन सेवाओं से संपर्क किया जा रहा है।" ],
        read_reminders: (remindersText: string) => [ `आपके कुछ रिमाइंडर आने वाले हैं: ${remindersText}।`, `यहां आपके अगले रिमाइंडर हैं: ${remindersText}।`, `ठीक है, आपके आने वाले रिमाइंडर हैं: ${remindersText}।` ],
        no_reminders: () => ["आपके पास कोई आगामी रिमाइंडर नहीं है।"],
        sos_unavailable: () => ["एसओएस सुविधा केवल रोगियों के लिए उपलब्ध है।"],
        reminders_unavailable: () => ["आप शेड्यूल या रोगी रिकॉर्ड पेज से रोगी रिमाइंडर देख सकते हैं।"],
        no_speech: () => ["मैंने कुछ नहीं सुना। कृपया दोबारा प्रयास करें।", "माफ़ कीजिए, मैं आपको सुन नहीं सकी। क्या आप ज़ोर से बोल सकते हैं?", "मैंने वह नहीं सुना। क्या आप उसे दोबारा कह सकते हैं?"],
        speech_error: () => ["क्षमा करें, मेरी आवाज़ अभी काम नहीं कर रही है। कृपया थोड़ी देर में पुनः प्रयास करें।"],
        network_error: () => ["मैं कनेक्ट नहीं कर पा रही हूँ। कृपया अपना इंटरनेट कनेक्शन जांचें।"]
    },
    'ta-IN': {
        navigate: (view: string) => [ `நிச்சயமாக, இப்போது ${view}க்குச் செல்கிறேன்.`, `சரி, ${view} பக்கத்தைத் திறக்கிறேன்.`, `இதோ ${view} பிரிவு.` ],
        call_sos: () => [ "SOS இப்போது செயல்படுத்தப்படுகிறது.", "அவசர எச்சரிக்கை இயக்கப்பட்டது। உதவி வரும் வழியில் உள்ளது.", "உங்களுக்காக அவசர சேவைகளைத் தொடர்புகொள்கிறோம்." ],
        read_reminders: (remindersText: string) => [ `உங்களுக்கு சில நினைவூட்டல்கள் வரவுள்ளன: ${remindersText}.`, `உங்கள் அடுத்த நினைவூட்டல்கள் இங்கே: ${remindersText}.`, `சரி, உங்கள் வரவிருக்கும் நினைவூட்டல்கள்: ${remindersText}.` ],
        no_reminders: () => ["உங்களுக்கு வரவிருக்கும் நினைவூட்டல்கள் எதுவும் இல்லை."],
        sos_unavailable: () => ["SOS அம்சம் நோயாளிகளுக்கு மட்டுமே கிடைக்கும்."],
        reminders_unavailable: () => ["நீங்கள் நோயாளியின் நினைவூட்டல்களை அட்டவணை அல்லது நோయాளி பதிவுகள் பக்கத்திலிருந்து பார்க்கலாம்."],
        no_speech: () => ["நான் எதுவும் கேட்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.", "மன்னிக்கவும், உங்கள் குரல் கேட்கவில்லை. சத்தமாக பேச முடியுமா?", "நான் அதை தவறவிட்டேன். மீண்டும் சொல்ல முடியுமா?"],
        speech_error: () => ["மன்னிக்கவும், எனது குரல் இப்போது வேலை செய்யவில்லை. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்."],
        network_error: () => ["என்னால் இணைக்க முடியவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்."]
    },
};

const getRandomResponse = (responses: string[]): string => {
    return responses[Math.floor(Math.random() * responses.length)];
};

// Helper to format reminder text since the data (title, time) is in English
const formatReminderText = (reminder: Reminder, lang: string): string => {
    // Default English format
    const defaultConnectors = {
        medication: `${reminder.title} at ${reminder.time}`,
        appointment: `an appointment for ${reminder.title} at ${reminder.time}`
    };

    if (lang === 'hi-IN') {
        const timeStr = reminder.time
            .replace(/Tomorrow/i, 'कल')
            .replace(/Today/i, 'आज')
            .replace(/AM/i, 'सुबह')
            .replace(/PM/i, 'शाम');
        const text = `${timeStr} बजे`;
        if (reminder.type === 'Medication') {
            return `${reminder.title} ${text}`;
        } else { // Appointment
            return `${text} ${reminder.title} के लिए अपॉइंटमेंट`;
        }
    }

    // A generic approach for other languages if not specifically handled
    const genericConnectors: {[key: string]: { medication: string, appointment: string }} = {
        'ta-IN': { medication: `${reminder.title} ${reminder.time} மணிக்கு`, appointment: `${reminder.title}க்கான அப்பாயிண்ட்மெண்ட் ${reminder.time} மணிக்கு`},
    };
    
    const langConnectors = genericConnectors[lang as keyof typeof genericConnectors] || defaultConnectors;
    return reminder.type === 'Medication' ? langConnectors.medication : langConnectors.appointment;
};

const joinReminderTexts = (texts: string[], lang: string): string => {
    if (texts.length === 0) return "";
    if (texts.length === 1) return texts[0];

    const separator: {[key: string]: string} = {
        'en-US': ', and ',
        'hi-IN': ' और ',
        'ta-IN': ' மற்றும் ',
    };
    const last = texts.pop()!;
    return texts.join(', ') + (separator[lang as keyof typeof separator] || separator['en-US']) + last;
};

// SpeechRecognition might not be on the window object in all browsers
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
// FIX: Use `any` for the SpeechRecognition type as it is a non-standard browser API.
let recognition: any | null = null;
if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    // recognition.lang will be set dynamically
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

interface VoiceAssistantProps {
  setActiveView: (view: View | DoctorView) => void;
  onSosClick: () => void;
  reminders: Reminder[];
  userName: string;
  availableViews: (View | DoctorView)[];
  currentUserId: string;
  role: 'patient' | 'doctor';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ setActiveView, onSosClick, reminders, userName, availableViews, currentUserId, role }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAvailable, setIsAvailable] = useState(!!recognition);
    const [assistantMessage, setAssistantMessage] = useState('');
    
    // New state for language support
    const [language, setLanguage] = useState('en-US');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    
    // Load available voices for speech synthesis
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        }
    }, []);

    // Keep-alive for Speech Synthesis to prevent it from going idle on some browsers
    useEffect(() => {
        const keepAliveInterval = setInterval(() => {
            if (window.speechSynthesis) {
                // Calling resume periodically helps keep the speech synthesis engine active.
                window.speechSynthesis.resume();
            }
        }, 5000); // Ping every 5 seconds

        return () => {
            clearInterval(keepAliveInterval);
        };
    }, []);
    
    useEffect(() => {
        if (assistantMessage) {
            const timer = setTimeout(() => {
                setAssistantMessage('');
            }, 5000); // Message disappears after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [assistantMessage]);


    const speak = (text: string, lang: string, onEndCallback?: () => void) => {
        // FIX: Cancel any previous speech synthesis to prevent queueing issues, which can cause silent failures.
        window.speechSynthesis.cancel();

        setAssistantMessage(text);
        let sanitizedText = text;
        if (['hi-IN'].includes(lang)) {
            sanitizedText = sanitizedText.replace(/[.?!]/g, '।');
        } else if (lang === 'ta-IN') {
            // Use period for better TTS compatibility in these languages
            sanitizedText = sanitizedText.replace(/[?!]/g, '.');
        } else {
            // For English, ensure question marks don't cause issues, though less common.
            sanitizedText = sanitizedText.replace(/\?/g, '.');
        }
        
        sanitizedText = sanitizedText.trim();

        if (!sanitizedText || sanitizedText === '।' || sanitizedText === '.') {
            console.warn("Skipping speech for empty or punctuation-only text.");
            if (onEndCallback) {
                onEndCallback();
            } else {
                setIsProcessing(false);
            }
            return;
        }

        const utterance = new SpeechSynthesisUtterance(sanitizedText);
        utterance.lang = lang;
        
        const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`No voice found for language: ${lang}. Using default.`);
        }

        utterance.onend = () => {
             if (onEndCallback) {
                onEndCallback();
            } else {
                setIsProcessing(false); // Reset state after speaking by default
            }
        };
        
        // FIX: Add an error handler to log issues with speech synthesis.
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];
            setAssistantMessage(getRandomResponse(responsesForLang.speech_error()));
            // Ensure processing state is reset even if speech fails
            if (onEndCallback) {
                onEndCallback();
            } else {
                setIsProcessing(false);
            }
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const handleAction = (action: VoiceAction) => {
        let textToSpeak = action.response; // Default to Gemini's response
        const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];

        switch (action.action) {
            case 'navigate':
                if (action.payload && availableViews.includes(action.payload as (View | DoctorView))) {
                    textToSpeak = getRandomResponse(responsesForLang.navigate(action.payload));
                    setActiveView(action.payload as (View | DoctorView));
                }
                break;

            case 'call_sos':
                if (role === 'patient') {
                    textToSpeak = getRandomResponse(responsesForLang.call_sos());
                    onSosClick();
                } else {
                    textToSpeak = getRandomResponse(responsesForLang.sos_unavailable());
                }
                break;

            case 'read_reminders':
                if (role !== 'patient') {
                    textToSpeak = getRandomResponse(responsesForLang.reminders_unavailable());
                    break;
                }
                const upcomingReminders = reminders
                    .filter(r => r.patientId === currentUserId && !r.taken)
                    .slice(0, 2);

                if (upcomingReminders.length === 0) {
                    textToSpeak = getRandomResponse(responsesForLang.no_reminders());
                } else {
                    const reminderStrings = upcomingReminders.map(r => formatReminderText(r, language));
                    const remindersText = joinReminderTexts(reminderStrings, language);
                    textToSpeak = getRandomResponse(responsesForLang.read_reminders(remindersText));
                }
                break;

            case 'answer_question':
            case 'unknown':
                // For these, Gemini's generated response is best, so we don't change textToSpeak
                break;
        }

        speak(textToSpeak, language);
    };


    const processCommand = async (command: string) => {
        setIsProcessing(true);
        const langName = SUPPORTED_LANGUAGES[language] || 'English';
        const action = await getVoiceCommandAction(command, availableViews as string[], language, langName);
        handleAction(action);
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onstart = () => {
            setIsListening(true);
            setIsProcessing(false);
        };

        // FIX: Use `any` for the SpeechRecognitionEvent type as it is a non-standard browser API.
        recognition.onresult = (event: any) => {
            const command = event.results[0][0].transcript;
            if (command) {
                processCommand(command);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        // FIX: Use `any` for the SpeechRecognitionErrorEvent type as it is a non-standard browser API.
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setIsProcessing(false);
            const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];
            
            if(event.error === 'not-allowed') {
                speak("I can't hear you. Please enable microphone permissions in your browser settings.", language);
                setIsAvailable(false);
            } else if (event.error === 'no-speech') {
                speak(getRandomResponse(responsesForLang.no_speech()), language);
            } else if (event.error === 'network') {
                speak(getRandomResponse(responsesForLang.network_error()), language);
            }
        };

        return () => {
            if (recognition) {
                recognition.stop();
                window.speechSynthesis.cancel();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);
    
    const greetings: {[key: string]: string} = {
        'en-US': "How can I help you?",
        'hi-IN': "मैं आपकी कैसे मदद कर सकती हूँ।",
        'ta-IN': "நான் உங்களுக்கு எப்படி உதவ முடியும்.",
    };

    const toggleListening = () => {
        if (!isAvailable) {
            speak("Sorry, the voice assistant is not available on this browser or permissions are denied.", language);
            return;
        }

        if (isListening) {
            recognition?.stop();
        } else if (!isProcessing && !isListening) { // Guard against race conditions
            setIsProcessing(true); // Enter "starting" state, which disables the button
            
            const greetingText = greetings[language] || greetings['en-US'];

            const startRecognition = () => {
                 try {
                    if (recognition) {
                        recognition.lang = language;
                        recognition.start();
                        // onstart event will handle setting isListening and resetting isProcessing
                    }
                } catch (e) {
                    console.error("Could not start recognition:", e);
                    setIsListening(false);
                    setIsProcessing(false); // Reset states on error
                }
            };

            speak(greetingText, language, startRecognition);
        }
    };
    
    if (!isAvailable) {
        return null; 
    }

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-3">
                 {assistantMessage && (
                    <div className="relative mb-2">
                        <div className="bg-white rounded-lg shadow-xl p-4 min-w-[200px] max-w-xs animate-fade-in-up-fast">
                            <p className="text-gray-700 text-center text-lg">{assistantMessage}</p>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 transform translate-y-[calc(50%-1px)] rotate-45 w-4 h-4 bg-white"></div>
                    </div>
                )}
                 {isLanguageMenuOpen && (
                    <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col gap-1 animate-fade-in-up-fast">
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                            <button
                                key={code}
                                onClick={() => {
                                    setLanguage(code);
                                    setIsLanguageMenuOpen(false);
                                }}
                                className={`px-4 py-2 text-md w-full text-left rounded font-semibold transition-colors ${
                                    language === code ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex items-end gap-3">
                    <button
                        onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                        className="h-14 w-14 rounded-full bg-white shadow-lg text-teal-600 font-bold text-lg flex items-center justify-center transition-transform hover:scale-110"
                        aria-label="Change language"
                    >
                        {language.split('-')[0].toUpperCase()}
                    </button>
                    <button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        className={`h-20 w-20 rounded-full text-white shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:scale-100 disabled:cursor-wait ${
                            isListening ? 'bg-red-500' : 'bg-teal-600'
                        } ${isProcessing ? 'bg-blue-500' : ''}`}
                        aria-label="Activate voice assistant"
                    >
                        {isProcessing ? <SparklesIcon /> : <MicrophoneIcon />}
                        {isListening && <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping-slow opacity-75"></span>}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes ping-slow {
                  75%, 100% {
                    transform: scale(2);
                    opacity: 0;
                  }
                }
                .animate-ping-slow {
                  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
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
        </>
    );
};

export default VoiceAssistant;