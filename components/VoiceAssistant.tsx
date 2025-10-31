import React, { useState, useEffect } from 'react';
import { getVoiceCommandAction } from '../services/geminiService';
import { View, DoctorView, Reminder, VoiceAction } from '../types';
import { MicrophoneIcon, SparklesIcon } from './icons/Icons';

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
        // Speech Recognition Errors
        mic_permission: () => ["Microphone access is disabled. Please enable it in your browser settings to use voice commands."],
        no_speech: () => ["I didn't hear anything. Please try again.", "Sorry, I couldn't hear you. Can you speak up?", "I missed that. Could you say it again?"],
        network_error: () => ["I can't seem to connect. Please check your internet connection."],
        recognition_error: () => ["I had trouble understanding. Please try speaking again.", "Sorry, I couldn't catch that. Could you repeat it?"],
        // Speech Synthesis Errors
        synthesis_error: () => ["Sorry, my voice isn't working right now. Please try again in a bit."],
        synthesis_network: () => ["I couldn't speak due to a network issue. Please check your connection."],
        language_unavailable: () => ["Sorry, I can't speak that language on this device."],
        synthesis_failed: () => ["Sorry, I couldn't speak that for some reason. Please try again."],
        audio_busy: () => ["It seems my voice is busy. Please wait a moment and try again."],
        // General
        unsupported: () => ["Sorry, voice commands are not supported on this browser."]
    },
    'hi-IN': {
        navigate: (view: string) => [ `ज़रूर, ${view} पर जा रहे हैं।`, `ठीक है, ${view} पेज खोल रहे हैं।`, `यह रहा ${view} सेक्शन।` ],
        call_sos: () => [ "अभी एसओएस सक्रिय किया जा रहा है।", "आपातकालीन चेतावनी चालू हो गई है। मदद रास्ते में है।", "आपके लिए आपातकालीन सेवाओं से संपर्क किया जा रहा है।" ],
        read_reminders: (remindersText: string) => [ `आपके कुछ रिमाइंडर आने वाले हैं: ${remindersText}।`, `यहां आपके अगले रिमाइंडर हैं: ${remindersText}।`, `ठीक है, आपके आने वाले रिमाइंडर हैं: ${remindersText}।` ],
        no_reminders: () => ["आपके पास कोई आगामी रिमाइंडर नहीं है।"],
        sos_unavailable: () => ["एसओएस सुविधा केवल रोगियों के लिए उपलब्ध है।"],
        reminders_unavailable: () => ["आप शेड्यूल या रोगी रिकॉर्ड पेज से रोगी रिमाइंडर देख सकते हैं।"],
        mic_permission: () => ["माइक्रोफ़ोन एक्सेस अक्षम है। कृपया वॉयस कमांड का उपयोग करने के लिए इसे अपनी ब्राउज़र सेटिंग्स में सक्षम करें।"],
        no_speech: () => ["मैंने कुछ नहीं सुना। कृपया दोबारा प्रयास करें।", "माफ़ कीजिए, मैं आपको सुन नहीं सकी। क्या आप ज़ोर से बोल सकते हैं?", "मैंने वह नहीं सुना। क्या आप उसे दोबारा कह सकते हैं?"],
        network_error: () => ["मैं कनेक्ट नहीं कर पा रही हूँ। कृपया अपना इंटरनेट कनेक्शन जांचें।"],
        recognition_error: () => ["मुझे समझने में कठिनाई हुई। कृपया दोबारा बोलने का प्रयास करें।", "माफ़ कीजिए, मैं सुन नहीं सकी। क्या आप दोहरा सकते हैं?"],
        synthesis_error: () => ["क्षमा करें, मेरी आवाज़ अभी काम नहीं कर रही है। कृपया थोड़ी देर में पुनः प्रयास करें।"],
        synthesis_network: () => ["नेटवर्क समस्या के कारण मैं बोल नहीं सकी। कृपया अपना कनेक्शन जांचें।"],
        language_unavailable: () => ["क्षमा करें, मैं इस डिवाइस पर वह भाषा नहीं बोल सकती।"],
        synthesis_failed: () => ["क्षमा करें, मैं किसी कारण से वह नहीं बोल सकी। कृपया पुनः प्रयास करें।"],
        audio_busy: () => ["ऐसा लगता है कि मेरी आवाज़ व्यस्त है। कृपया एक क्षण प्रतीक्षा करें और पुनः प्रयास करें।"],
        unsupported: () => ["क्षमा करें, इस ब्राउज़र पर वॉयस कमांड समर्थित नहीं हैं।"]
    },
    'ta-IN': {
        navigate: (view: string) => [ `நிச்சயமாக, இப்போது ${view}க்குச் செல்கிறேன்.`, `சரி, ${view} பக்கத்தைத் திறக்கிறேன்.`, `இதோ ${view} பிரிவு.` ],
        call_sos: () => [ "SOS இப்போது செயல்படுத்தப்படுகிறது.", "அவசர எச்சரிக்கை இயக்கப்பட்டது। உதவி வரும் வழியில் உள்ளது.", "உங்களுக்காக அவசர சேவைகளைத் தொடர்புகொள்கிறோம்." ],
        read_reminders: (remindersText: string) => [ `உங்களுக்கு சில நினைவூட்டல்கள் வரவுள்ளன: ${remindersText}.`, `உங்கள் அடுத்த நினைவூட்டல்கள் இங்கே: ${remindersText}.`, `சரி, உங்கள் வரவிருக்கும் நினைவூட்டல்கள்: ${remindersText}.` ],
        no_reminders: () => ["உங்களுக்கு வரவிருக்கும் நினைவூட்டல்கள் எதுவும் இல்லை."],
        sos_unavailable: () => ["SOS அம்சம் நோயாளிகளுக்கு மட்டுமே கிடைக்கும்."],
        reminders_unavailable: () => ["நீங்கள் நோயாளியின் நினைவூட்டல்களை அட்டவணை அல்லது நோயாளி பதிவுகள் பக்கத்திலிருந்து பார்க்கலாம்."],
        mic_permission: () => ["மைக்ரோஃபோன் அணுகல் முடக்கப்பட்டுள்ளது. குரல் கட்டளைகளைப் பயன்படுத்த உங்கள் உலாவி அமைப்புகளில் அதை இயக்கவும்."],
        no_speech: () => ["நான் எதுவும் கேட்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.", "மன்னிக்கவும், உங்கள் குரல் கேட்கவில்லை. சத்தமாக பேச முடியுமா?", "நான் அதை தவறவிட்டேன். மீண்டும் சொல்ல முடியுமா?"],
        network_error: () => ["என்னால் இணைக்க முடியவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்."],
        recognition_error: () => ["எனக்கு புரிந்து கொள்வதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் பேச முயற்சிக்கவும்.", "மன்னிக்கவும், என்னால் அதைப் பிடிக்க முடியவில்லை. நீங்கள் அதை மீண்டும் சொல்ல முடியுமா?"],
        synthesis_error: () => ["மன்னிக்கவும், எனது குரல் இப்போது வேலை செய்யவில்லை. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்."],
        synthesis_network: () => ["நெட்வொர்க் சிக்கல் காரணமாக என்னால் பேச முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்க்கவும்."],
        language_unavailable: () => ["மன்னிக்கவும், இந்தச் சாதனத்தில் என்னால் அந்த மொழியைப் பேச முடியாது."],
        synthesis_failed: () => ["மன்னிக்கவும், சில காரணங்களால் என்னால் அதைப் பேச முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."],
        audio_busy: () => ["என் குரல் பிஸியாக இருப்பதாகத் தெரிகிறது. தயவுசெய்து ஒரு கணம் காத்திருந்து மீண்டும் முயற்சிக்கவும்."],
        unsupported: () => ["மன்னிக்கவும், இந்த உலாவியில் குரல் கட்டளைகள் ஆதரிக்கப்படவில்லை."]
    },
};

const getRandomResponse = (responses: string[]): string => {
    return responses[Math.floor(Math.random() * responses.length)];
};

const formatReminderText = (reminder: Reminder, lang: string): string => {
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
        const text = `${timeStr}`;
        if (reminder.type === 'Medication') {
            return `${reminder.title} ${text}`;
        } else {
            return `${text} ${reminder.title} के लिए अपॉइंटमेंट`;
        }
    }

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

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
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
  onAddReminder?: (newReminderData: Omit<Reminder, 'id' | 'type'>) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ setActiveView, onSosClick, reminders, userName, availableViews, currentUserId, role, onAddReminder }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAvailable, setIsAvailable] = useState(!!recognition);
    const [assistantMessage, setAssistantMessage] = useState('');
    
    const [language, setLanguage] = useState('en-US');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    
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

    useEffect(() => {
        const keepAliveInterval = setInterval(() => {
            if (window.speechSynthesis) {
                window.speechSynthesis.resume();
            }
        }, 5000);

        return () => {
            clearInterval(keepAliveInterval);
        };
    }, []);
    
    useEffect(() => {
        if (assistantMessage) {
            const timer = setTimeout(() => {
                setAssistantMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [assistantMessage]);


    const speak = (text: string, lang: string, onEndCallback?: () => void) => {
        window.speechSynthesis.cancel();
        setAssistantMessage(text);
        let sanitizedText = text;
        
        if (lang === 'en-US') {
            // Keep original punctuation for better intonation in English
        } else if (['hi-IN'].includes(lang)) {
            sanitizedText = sanitizedText.replace(/[.?!]/g, '।');
        } else { // For other languages like Tamil
            sanitizedText = sanitizedText.replace(/[?!]/g, '.');
        }
        
        sanitizedText = sanitizedText.trim();

        if (!sanitizedText || sanitizedText === '।' || sanitizedText === '.') {
            if (onEndCallback) onEndCallback();
            else setIsProcessing(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(sanitizedText);
        utterance.lang = lang;
        
        const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onend = () => {
             if (onEndCallback) onEndCallback();
             else setIsProcessing(false);
        };
        
        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
            if (event.error === 'canceled' || event.error === 'interrupted') {
                if (onEndCallback) onEndCallback();
                else setIsProcessing(false);
                return;
            }
            
            console.error('SpeechSynthesisUtterance.onerror:', event.error, event);

            const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];
            let errorText: string;

            switch(event.error) {
                case 'network':
                    errorText = getRandomResponse(responsesForLang.synthesis_network());
                    break;
                case 'language-unavailable':
                    errorText = getRandomResponse(responsesForLang.language_unavailable());
                    break;
                case 'synthesis-failed':
                    errorText = getRandomResponse(responsesForLang.synthesis_failed());
                    break;
                case 'audio-busy':
                    errorText = getRandomResponse(responsesForLang.audio_busy());
                    break;
                default:
                    errorText = getRandomResponse(responsesForLang.synthesis_error());
                    break;
            }

            setAssistantMessage(errorText);
            if (onEndCallback) onEndCallback();
            else setIsProcessing(false);
        };
        
        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Error calling window.speechSynthesis.speak:", e);
            const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];
            setAssistantMessage(getRandomResponse(responsesForLang.synthesis_error()));
            if (onEndCallback) onEndCallback();
            else setIsProcessing(false);
        }
    };

    const handleAction = (action: VoiceAction) => {
        let textToSpeak = action.response;
        const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];

        switch (action.action) {
            case 'navigate':
                if (action.payload && typeof action.payload === 'string' && availableViews.includes(action.payload as (View | DoctorView))) {
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
            
            case 'add_reminder':
                if (role === 'patient' && onAddReminder && action.payload && typeof action.payload === 'object' && 'title' in action.payload && 'time' in action.payload && 'date' in action.payload) {
                    const { title, time, date, mealContext, patientId } = action.payload;
                    onAddReminder({ title, time, date, mealContext, patientId });
                    // Use the response generated by the service
                } else if (!textToSpeak) {
                    // Fallback confirmation if the service didn't provide one
                    textToSpeak = "I've added that reminder for you.";
                }
                break;

            case 'answer_question':
            case 'unknown':
                break;
        }

        speak(textToSpeak, language);
    };


    const processCommand = async (command: string) => {
        setIsProcessing(true);
        const langName = SUPPORTED_LANGUAGES[language] || 'English';
        try {
            const action = await getVoiceCommandAction(command, availableViews as string[], language, langName, role, currentUserId);
            handleAction(action);
        } catch (e: any) {
            console.error("Failed to process voice command:", e);
            const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];
            let errorText = getRandomResponse(responsesForLang.recognition_error());
            if (e.message.includes('API')) {
                errorText = getRandomResponse(responsesForLang.network_error());
            }
            speak(errorText, language);
        }
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onstart = () => {
            setIsListening(true);
            setIsProcessing(false);
        };

        recognition.onresult = (event: any) => {
            const command = event.results[0][0].transcript;
            if (command) {
                processCommand(command);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setIsProcessing(false);
            const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];
            
            let errorText = getRandomResponse(responsesForLang.recognition_error());
            switch(event.error) {
                case 'not-allowed':
                    errorText = getRandomResponse(responsesForLang.mic_permission());
                    setIsAvailable(false); // Disable future attempts until page refresh
                    break;
                case 'no-speech': 
                    errorText = getRandomResponse(responsesForLang.no_speech());
                    break;
                case 'network':
                    errorText = getRandomResponse(responsesForLang.network_error());
                    break;
            }
            speak(errorText, language);
        };

        return () => {
            if (recognition) recognition.stop();
            window.speechSynthesis.cancel();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, currentUserId, reminders, onAddReminder]);
    
    const greetings: {[key: string]: string} = {
        'en-US': `Hi ${userName}, how can I help?`,
        'hi-IN': `नमस्ते ${userName}, मैं आपकी कैसे मदद कर सकती हूँ?`,
        'ta-IN': `வணக்கம் ${userName}, நான் உங்களுக்கு எப்படி உதவ முடியும்?`,
    };

    const toggleListening = () => {
        if (!isAvailable) {
            speak(getRandomResponse(LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES].unsupported()), language);
            return;
        }

        if (isListening) {
            recognition?.stop();
        } else if (!isProcessing && !isListening) {
            setIsProcessing(true);
            const greetingText = greetings[language] || greetings['en-US'];
            const startRecognition = () => {
                 try {
                    if (recognition) {
                        recognition.lang = language;
                        recognition.start();
                    }
                } catch (e) {
                    console.error("Could not start recognition:", e);
                    setIsListening(false);
                    setIsProcessing(false);
                }
            };
            speak(greetingText, language, startRecognition);
        }
    };
    
    if (!isAvailable && !assistantMessage) {
        return (
             <div className="fixed bottom-8 right-8 z-50">
                 <button
                    onClick={toggleListening}
                    className="h-20 w-20 rounded-full bg-gray-300 text-white shadow-2xl flex items-center justify-center cursor-not-allowed"
                    aria-label="Voice assistant not available"
                    title="Voice assistant not supported on this browser or permissions denied"
                 >
                    <MicrophoneIcon />
                 </button>
             </div>
        ); 
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
                                onClick={() => { setLanguage(code); setIsLanguageMenuOpen(false); }}
                                className={`px-4 py-2 text-md w-full text-left rounded font-semibold transition-colors ${ language === code ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100' }`}
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
                        disabled={isProcessing || !isAvailable}
                        className={`h-20 w-20 rounded-full text-white shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:scale-100 disabled:cursor-wait ${ isListening ? 'bg-red-500' : 'bg-teal-600' } ${isProcessing ? 'bg-blue-500' : ''} ${!isAvailable ? 'bg-gray-300' : ''}`}
                        aria-label="Activate voice assistant"
                    >
                        {isProcessing ? <SparklesIcon /> : <MicrophoneIcon />}
                        {isListening && <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping-slow opacity-75"></span>}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes ping-slow { 75%, 100% { transform: scale(2); opacity: 0; } }
                .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
                @keyframes fade-in-up-fast { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up-fast { animation: fade-in-up-fast 0.2s ease-out forwards; }
            `}</style>
        </>
    );
};

export default VoiceAssistant;