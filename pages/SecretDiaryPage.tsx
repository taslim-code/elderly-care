import React, { useState, useRef, useEffect } from 'react';
import { DiaryMessage, Mood } from '../types';
import { getDiaryResponse, transcribeAudio } from '../services/geminiService';
import { LockClosedIcon, TrashIcon, PaperClipIcon, XCircleIcon, DocumentTextIcon, StarIcon, MicrophoneIcon, StopIcon } from '../components/icons/Icons';

const getMediaType = (fileType: string): 'image' | 'video' | 'document' => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
};

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

const SecretDiaryPage: React.FC = () => {
    const [messages, setMessages] = useState<DiaryMessage[]>([
        {
            id: 'init-1',
            sender: 'ai',
            text: 'Hello, this is your private diary, Echo. You can share anything on your mind with me. Your thoughts are safe here.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    // Mood logging state
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [rating, setRating] = useState(0);

    // Voice recording state
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
    const [audioData, setAudioData] = useState<{ url: string; blob: Blob } | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);

    const resetInputs = () => {
        setUserInput('');
        setFileToUpload(null);
        setSelectedMood(null);
        setRating(0);
        setAudioData(null);
    };
    
    const resetComposer = () => {
        resetInputs();
        setRecordingStatus('idle');
        setRecordingDuration(0);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    };


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasContent = userInput.trim() || fileToUpload || audioData;
        if (!hasContent || isLoading) return;

        const messageId = `msg-${Date.now()}`;
        let mediaUrl: string | undefined;
        let mediaType: DiaryMessage['mediaType'];
        let fileName: string | undefined;

        if (fileToUpload) {
            mediaUrl = URL.createObjectURL(fileToUpload);
            mediaType = getMediaType(fileToUpload.type);
            fileName = fileToUpload.name;
        } else if (audioData) {
            mediaUrl = audioData.url;
            mediaType = 'audio';
        }

        const newUserMessage: DiaryMessage = {
            id: messageId,
            sender: 'user',
            text: audioData ? '...' : userInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mediaUrl, mediaType, fileName,
            mood: selectedMood || undefined,
            rating: selectedMood ? rating : undefined,
        };

        const currentHistory = [...messages, newUserMessage];
        setMessages(currentHistory);
        resetComposer();
        setIsLoading(true);

        try {
            let historyForAi = currentHistory;

            if (audioData) {
                const base64Audio = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(audioData.blob);
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                });

                const transcribedText = await transcribeAudio(base64Audio, audioData.blob.type);
                const textForAi = transcribedText || "(No speech detected)";
                
                const updatedMessage = { ...newUserMessage, text: textForAi };

                const updatedHistory = currentHistory.map(msg => 
                    msg.id === messageId ? updatedMessage : msg
                );
                setMessages(updatedHistory);
                historyForAi = updatedHistory;
            }

            const aiResponseText = await getDiaryResponse(historyForAi, 'en-US');
            const newAiMessage: DiaryMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: aiResponseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, newAiMessage]);

        } catch (error) {
            console.error("Error in diary flow:", error);
            const errorText = (error instanceof Error && error.message.includes("transcribe"))
                ? "(Sorry, I couldn't understand that.)"
                : "I'm sorry, I'm having a little trouble thinking right now.";
            
            if (audioData) {
                setMessages(prev => prev.map(msg => 
                    msg.id === messageId ? { ...msg, text: errorText } : msg
                ));
            } else {
                const errorAiMessage: DiaryMessage = {
                    id: `msg-err-${Date.now()}`,
                    sender: 'ai',
                    text: errorText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, errorAiMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearDiary = () => {
        if (window.confirm('Are you sure you want to permanently delete all diary entries? This action cannot be undone.')) {
            setMessages([
                {
                    id: 'init-1',
                    sender: 'ai',
                    text: 'Your diary has been cleared. Feel free to start fresh whenever you like.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        }
    };
    
    const handleStartRecording = async () => {
        if (recordingStatus === 'recording') return;
        
        resetInputs();
        setRecordingStatus('recording');
        setRecordingDuration(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const audioChunks: BlobPart[] = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                if (audioBlob.size > 0) {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioData({ url: audioUrl, blob: audioBlob });
                } else {
                    console.warn("Recorded audio is empty.");
                }
                setRecordingStatus('stopped');
                stream.getTracks().forEach(track => track.stop());
                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                    recordingIntervalRef.current = null;
                }
            };

            mediaRecorderRef.current.start();
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check your browser permissions.");
            setRecordingStatus('idle');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };


    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-64px)]">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-5xl font-bold text-gray-800">Secret Diary</h2>
                    <p className="text-2xl text-gray-500 mt-2">Your private space to reflect and share.</p>
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
                                    {msg.mediaUrl && (
                                        <div className="mb-2">
                                            {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="Diary attachment" className="rounded-lg max-w-xs max-h-60" />}
                                            {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="rounded-lg max-w-xs max-h-60" />}
                                            {msg.mediaType === 'audio' && <audio controls src={msg.mediaUrl} className="w-full" />}
                                            {msg.mediaType === 'document' && (
                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                                                    <DocumentTextIcon className="h-8 w-8 text-gray-600 mr-3" />
                                                    <span className="font-semibold text-gray-700 underline truncate">{msg.fileName}</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {msg.text && <p className={`whitespace-pre-wrap ${msg.text === '...' ? 'italic text-gray-400' : ''}`}>{msg.text}</p>}
                                    <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'} text-right`}>{msg.timestamp}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
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
                        <span>Your entries are private and only stored for this session.</span>
                    </div>
                    
                    {fileToUpload && (
                        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                            <span className="text-gray-700 truncate">Attaching: <span className="font-semibold">{fileToUpload.name}</span></span>
                            <button onClick={() => setFileToUpload(null)} className="p-1 text-gray-500 hover:text-red-600"><XCircleIcon className="h-5 w-5" /></button>
                        </div>
                    )}
                    {audioData && (
                        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                             <audio src={audioData.url} controls className="w-full" />
                            <button onClick={resetComposer} className="p-1 text-gray-500 hover:text-red-600 ml-2"><XCircleIcon className="h-5 w-5" /></button>
                        </div>
                    )}
                     {recordingStatus === 'recording' && (
                        <div className="mb-2 p-3 bg-red-50 text-red-700 rounded-lg flex items-center justify-center font-semibold">
                            <span className="relative flex h-3 w-3 mr-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                            Recording... {formatDuration(recordingDuration)}
                        </div>
                    )}

                    {!audioData && recordingStatus !== 'recording' && (
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
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        {recordingStatus !== 'recording' && (
                            <>
                                <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.txt"/>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full" disabled={!!audioData}><PaperClipIcon className="h-6 w-6" /></button>
                                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Share your thoughts..." className="flex-1 bg-gray-100 border-2 border-transparent focus:border-teal-500 rounded-full px-5 py-3 text-lg focus:outline-none" disabled={isLoading || !!audioData}/>
                            </>
                        )}
                        
                        {recordingStatus === 'idle' && (
                            <button type="button" onClick={handleStartRecording} className="p-3 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"><MicrophoneIcon className="h-6 w-6" /></button>
                        )}
                        {recordingStatus === 'recording' && (
                             <button type="button" onClick={handleStopRecording} className="p-3 text-white bg-red-500 hover:bg-red-600 rounded-full"><StopIcon className="h-6 w-6" /></button>
                        )}
                        
                        <button type="submit" disabled={isLoading || (!userInput.trim() && !fileToUpload && !audioData)} className="bg-teal-600 text-white rounded-full p-3 hover:bg-teal-700 transition-colors disabled:bg-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SecretDiaryPage;