import React, { useEffect, useRef, useState } from 'react';
import type { Reminder, ReminderAction } from '../types';
import { RingingBellIcon, MicrophoneIcon, SparklesIcon } from './icons/Icons';
import { getReminderAction } from '../services/geminiService';

interface AlarmModalProps {
  reminder: Reminder | null;
  onMarkAsTaken: (reminderId: string) => void;
  onAddReminder: (newReminderData: Omit<Reminder, 'id' | 'type' | 'taken'>) => void;
}

const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  'en-US': 'EN',
  'hi-IN': 'HI',
};

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
}

const AlarmModal: React.FC<AlarmModalProps> = ({ reminder, onMarkAsTaken, onAddReminder }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSpokenAlertRef = useRef(false);

  const [isChatbotActive, setIsChatbotActive] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatbotMessage, setChatbotMessage] = useState('');

  useEffect(() => {
    if (reminder) {
      // Play ringing sound
      if (!audioRef.current) {
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(error => {
        console.warn("Audio playback was prevented by the browser. A user interaction is required.", error);
      });

      // Speak the alert text only once when the modal appears
      if (!hasSpokenAlertRef.current) {
        const time = new Date(`1970-01-01T${reminder.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const alertText = `Reminder. It is time for your medication: ${reminder.title}, scheduled for ${time}.`;
        const utterance = new SpeechSynthesisUtterance(alertText);
        utterance.lang = 'en-US';
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            if (e.error === 'canceled' || e.error === 'interrupted') {
                return; // Ignore benign interruptions
            }
            console.error('SpeechSynthesisUtterance.onerror for initial alert:', e.error, e);
        };
        try {
            window.speechSynthesis.speak(utterance);
        } catch(e) {
            console.error("Error calling speechSynthesis.speak for reminder alert:", e);
        }
        hasSpokenAlertRef.current = true;
      }
    } else {
      // Cleanup when modal closes (reminder becomes null)
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      hasSpokenAlertRef.current = false; // Reset for the next reminder
      
      // Reset chatbot state
      setIsChatbotActive(false);
      setChatbotMessage('');
      setIsListening(false);
      setIsProcessing(false);
      if (recognition?.stop) recognition.stop();
    }

    // Cleanup function when the component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.speechSynthesis.cancel();
    };
  }, [reminder]);


  const speak = (text: string, onEndCallback?: () => void) => {
    window.speechSynthesis.cancel();
    setChatbotMessage(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onend = () => {
      setIsProcessing(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
            // Not a critical error.
            setIsProcessing(false);
            if (onEndCallback) onEndCallback();
            return;
        }

        console.error('SpeechSynthesisUtterance.onerror in AlarmModal chatbot:', event.error, event);

        let errorText: string;
        const langName = language === 'hi-IN' ? 'Hindi' : 'English';

        switch (event.error) {
            case 'network':
                errorText = "I couldn't speak due to a network issue.";
                break;
            case 'language-unavailable':
                errorText = `Sorry, I can't speak ${langName} on this device.`;
                break;
            case 'synthesis-failed':
                errorText = "Sorry, my voice failed to start.";
                break;
            case 'audio-busy':
                errorText = "My voice is busy right now.";
                break;
            case 'audio-hardware':
            case 'synthesis-unavailable':
            case 'voice-unavailable':
            case 'text-too-long':
            case 'invalid-argument':
            default:
                errorText = "An unexpected voice error occurred.";
                break;
        }

        setChatbotMessage(errorText);
        setIsProcessing(false);
        if (onEndCallback) onEndCallback();
    };
    try {
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.error("Error calling speechSynthesis.speak in alarm chatbot:", e);
        setChatbotMessage("An unexpected error occurred with the voice feature.");
        setIsProcessing(false);
        if (onEndCallback) onEndCallback();
    }
  };
  
  const handleAction = (action: ReminderAction) => {
      speak(action.response);
      
      switch (action.action) {
          case 'add_reminder':
              if (reminder && action.payload && action.payload.title && action.payload.time) {
                  // FIX: Added the 'date' property, which is required by the onAddReminder prop and is available in the action payload.
                  onAddReminder({
                      patientId: reminder.patientId,
                      title: action.payload.title,
                      date: action.payload.date,
                      time: action.payload.time,
                      mealContext: action.payload.mealContext,
                  });
              }
              break;
          case 'confirm_taken':
              if (reminder) {
                  onMarkAsTaken(reminder.id);
              }
              break;
          case 'unknown':
              break;
      }
  };

  const processCommand = async (command: string) => {
      setIsProcessing(true);
      setChatbotMessage('Thinking...');
      const langName = language === 'hi-IN' ? 'Hindi' : 'English';
      try {
          const action = await getReminderAction(command, language, langName);
          handleAction(action);
      } catch (error) {
          console.error("Failed to process reminder command:", error);
          speak("Sorry, something went wrong. Please try again.");
      }
  };

  useEffect(() => {
      if (!recognition) return;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
             setChatbotMessage("Sorry, I couldn't hear you. Please try again.");
          }
      };
      recognition.onresult = (event: any) => {
          const command = event.results[0][0].transcript;
          if (command) {
              processCommand(command);
          }
      };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, reminder]);

  const handleMicClick = () => {
      if (!recognition) {
          alert("Voice recognition is not supported on this browser.");
          return;
      }
      
      if (isListening || isProcessing) {
          recognition.stop();
          setIsListening(false);
      } else {
          try {
              recognition.lang = language;
              recognition.start();
          } catch (e) {
              console.error("Could not start recognition:", e);
          }
      }
  };

  if (!reminder) return null;

  const handleMarkTakenAndClose = () => {
    onMarkAsTaken(reminder.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full m-4 text-center transform transition-all animate-fade-in-up">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
          <RingingBellIcon />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Time for your medication!</h3>
        <p className="text-2xl font-bold text-teal-700">{reminder.title}</p>
        <p className="text-lg text-gray-600 mb-8 mt-2">It's {reminder.time} - Time to take it {reminder.mealContext?.toLowerCase()}.</p>
        <button
          onClick={handleMarkTakenAndClose}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors duration-200"
        >
          I've Taken It
        </button>

        <div className="mt-6 border-t pt-6">
            {!isChatbotActive ? (
                <button 
                    onClick={() => {
                        setIsChatbotActive(true);
                        setChatbotMessage(language === 'hi-IN' ? 'मैं कैसे मदद कर सकती हूँ?' : 'How can I help?');
                    }}
                    className="flex items-center justify-center w-full text-lg font-semibold text-gray-600 hover:text-teal-700 transition-colors"
                >
                    <MicrophoneIcon className="h-6 w-6 mr-2" />
                    Add or confirm by voice
                </button>
            ) : (
                <div className="space-y-4">
                    <p className="text-lg text-gray-700 h-8 flex items-center justify-center">
                        {isProcessing ? <SparklesIcon className="h-6 w-6 mx-auto animate-pulse text-blue-500" /> : chatbotMessage}
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex rounded-lg bg-gray-100 p-1">
                            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => setLanguage(code)}
                                    disabled={isListening || isProcessing}
                                    className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === code ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleMicClick}
                            disabled={!recognition}
                            className={`h-16 w-16 rounded-full text-white shadow-lg flex items-center justify-center transition-colors relative ${
                                isListening ? 'bg-red-500' : 'bg-teal-600'
                            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            <MicrophoneIcon className="h-8 w-8" />
                            {isListening && <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping-slow opacity-75"></span>}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-ring {
            animation: ring 1s ease-in-out infinite;
        }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.8); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default AlarmModal;