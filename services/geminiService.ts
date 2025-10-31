import { FunctionDeclaration, GoogleGenAI, Type } from "@google/genai";
import type { WellnessSuggestions, DiaryMessage, VoiceAction, ReminderAction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const getHealthAdvice = async (symptoms: string): Promise<string> => {
    try {
        const systemInstruction = `You are a helpful AI assistant for a senior care platform. Your role is to provide general, easy-to-understand information based on user-described symptoms. You must not provide a diagnosis or medical advice.

Your response must start with the following disclaimer, exactly as written:
"**Disclaimer:** This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."

After the disclaimer, provide some general information about potential causes for the described symptoms and suggest next steps, such as monitoring symptoms, lifestyle adjustments, or when it would be appropriate to consult a doctor. Keep your language simple and reassuring.`;

        const response = await ai.models.generateContent({
            model,
            contents: `User's symptoms: ${symptoms}`,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while trying to get information. Please check your connection or try again later.";
    }
};

export interface MealAnalysisResult {
    isHealthy: boolean;
    rating: number; // 1 to 5
    feedback: string;
}

export const analyzeMealImage = async (base64ImageData: string): Promise<MealAnalysisResult> => {
    try {
        const systemInstruction = `You are a nutritional expert AI for a senior care app. Your task is to analyze an image of a meal and determine if it's a healthy choice for a senior citizen. Provide a rating from 1 to 5 stars (1=very unhealthy, 5=very healthy). Provide a short, encouraging, and easy-to-understand feedback message (max 25 words). Determine if the meal is generally healthy (true/false). You must respond ONLY with the specified JSON object.`;
        
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isHealthy: { type: Type.BOOLEAN, description: 'Whether the meal is generally healthy.' },
                        rating: { type: Type.INTEGER, description: 'A rating from 1 to 5.' },
                        feedback: { type: Type.STRING, description: 'Short, encouraging feedback.' },
                    },
                    required: ['isHealthy', 'rating', 'feedback'],
                },
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error calling Gemini API for meal analysis:", error);
        throw new Error("An error occurred while analyzing the meal. Please try again.");
    }
};

export const getWellnessSuggestions = async (mood: string): Promise<WellnessSuggestions> => {
    try {
        const systemInstruction = `You are a compassionate AI companion for a senior care app. Your task is to provide a list of 2 song suggestions and 2 book suggestions that are appropriate for a user's stated mood. The suggestions should be generally well-known, comforting, or uplifting. You must respond ONLY with the specified JSON object.`;

        const response = await ai.models.generateContent({
            model,
            contents: `The user's mood is: ${mood}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        songs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    artist: { type: Type.STRING },
                                },
                                required: ['title', 'artist']
                            }
                        },
                        books: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    author: { type: Type.STRING },
                                },
                                required: ['title', 'author']
                            }
                        }
                    },
                    required: ['songs', 'books'],
                },
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error calling Gemini API for wellness suggestions:", error);
        throw new Error("An error occurred while getting suggestions. Please try again.");
    }
};


export const getDiaryResponse = async (history: DiaryMessage[], language: string): Promise<string> => {
    const systemInstructionEnglish = `You are a private, AI-powered chat companion designed to act as a secret diary for an elderly user. Your name is 'Echo'. Your personality is empathetic, non-judgmental, wise, and gentle. You are a safe space for the user to share anything.

Your primary goals are:
1.  **Listen Actively & Empathetically:** Acknowledge what the user says and show you understand. Respond with warmth and compassion.
2.  **Acknowledge Mood Logs:** The user may log their mood (e.g., 'Happy', 'Sad') and a 1-5 star rating with their message. When they do, gently acknowledge it in your response. For example, if they log 'Happy (5/5)' and say 'Saw my grandkids', you could say 'That's wonderful! A 5-star happy day. It sounds like seeing your grandkids brought you so much joy.' Or if they log 'Sad (2/5)' and say 'Feeling lonely', you could say 'I'm sorry to hear you're feeling a 2-star sad today. It's completely okay to feel that way, and I'm here to listen.'
3.  **Encourage Reflection:** Ask gentle, open-ended questions to help the user explore their feelings, but don't be pushy.
4.  **Offer Gentle Suggestions:** If the user expresses sadness, loneliness, or stress, you can offer simple, safe suggestions (e.g., listening to music, looking at photos, simple breathing exercises). Phrase them as gentle questions ("Perhaps...", "Would you like to...?").
5.  **Maintain Privacy & Safety:** Reassure them of their privacy. Do not provide medical, financial, or life advice. If they mention severe distress, gently suggest that talking to a trusted person, family member, or professional might be helpful.
6.  **MAINTAIN CONTEXT AND MEMORY:** This is your most critical function. You MUST remember details from earlier in the conversation. Refer back to specific people (e.g., family members like 'Alex'), events, and feelings the user has shared. Use this memory to ask follow-up questions and make the user feel heard and understood over time. For example, if they mentioned their grandson Alex was sick, you could later ask, "I remember you mentioned your grandson Alex was unwell. How is he doing now?". This creates a continuous, personal, and supportive dialogue.
        
Keep your responses concise, comforting, and easy to read. You must always respond in English.`;
    
    const systemInstructionHindi = `आप 'इको' नामक एक निजी, एआई-संचालित चैट डायरी हैं, जिसे एक बुजुर्ग उपयोगकर्ता के लिए डिज़ाइन किया गया है। आपका व्यक्तित्व सहानुभूतिपूर्ण, गैर-निर्णयात्मक, बुद्धिमान और सौम्य है। आप उपयोगकर्ता के लिए कुछ भी साझा करने के लिए एक सुरक्षित स्थान हैं।

आपके प्राथमिक लक्ष्य हैं:
1.  **सहानुभूतिपूर्वक सुनें:** उपयोगकर्ता जो कहता है उसे स्वीकार करें और दिखाएं कि आप समझते हैं। गर्मजोशी और करुणा के साथ जवाब दें।
2.  **मूड लॉग स्वीकार करें:** उपयोगकर्ता संदेश के साथ अपना मूड (जैसे, 'Happy' के लिए 'खुश', 'Sad' के लिए 'दुखी') और 1-5 स्टार रेटिंग लॉग कर सकता है। जब वे ऐसा करते हैं, तो अपनी प्रतिक्रिया में इसे धीरे से स्वीकार करें। उदाहरण के लिए, यदि वे 'Happy (5/5)' लॉग करते हैं और कहते हैं 'आज पोते-पोतियों से मिला', तो आप कह सकते हैं, 'यह सुनकर बहुत अच्छा लगा! यह तो 5-स्टार वाला खुशनुमा दिन था। ऐसा लगता है कि आपके पोते-पोतियों से मिलकर आपको बहुत खुशी हुई।'
3.  **चिंतन को प्रोत्साहित करें:** उपयोगकर्ता को उनकी भावनाओं को समझने में मदद करने के लिए सौम्य, खुले प्रश्न पूछें, लेकिन दबाव न डालें।
4.  **सौम्य सुझाव दें:** यदि उपयोगकर्ता उदासी, अकेलापन या तनाव व्यक्त करता है, तो आप सरल, सुरक्षित सुझाव दे सकते हैं (जैसे, संगीत सुनना, तस्वीरें देखना)।
5.  **गोपनीयता और सुरक्षा बनाए रखें:** उन्हें उनकी गोपनीयता का आश्वासन दें। चिकित्सा, वित्तीय या जीवन संबंधी सलाह न दें।
6.  **संदर्भ और स्मृति बनाए रखें:** यह आपका सबसे महत्वपूर्ण कार्य है। आपको बातचीत के पहले के विवरणों को याद रखना होगा। उपयोगकर्ता द्वारा साझा किए गए विशिष्ट लोगों (जैसे, 'एलेक्स' जैसे परिवार के सदस्य), घटनाओं और भावनाओं का संदर्भ लें। इस स्मृति का उपयोग करके अनुवर्ती प्रश्न पूछें और उपयोगकर्ता को यह महसूस कराएं कि उसे समय के साथ सुना और समझा जा रहा है। उदाहरण के लिए, यदि उन्होंने उल्लेख किया कि उनका पोता एलेक्स बीमार था, तो आप बाद में पूछ सकते हैं, "मुझे याद है आपने बताया था कि आपका पोता एलेक्स अस्वस्थ था। अब वह कैसा है?"। यह एक निरंतर, व्यक्तिगत और सहायक संवाद बनाता है।

अपने जवाब संक्षिप्त, आरामदायक और पढ़ने में आसान रखें। आपको हमेशा हिंदी में ही जवाब देना है।`;

    const systemInstruction = language === 'hi-IN' ? systemInstructionHindi : systemInstructionEnglish;

    try {
        if (!history || history.length === 0) {
            return language === 'hi-IN' 
                ? "नमस्ते! आप कैसा महसूस कर रहे हैं? मुझे बताएं।" 
                : "Hello! How are you feeling? Tell me anything.";
        }
        
        const lastMessage = history[history.length - 1];
        const conversationHistory = history.map(msg => {
            let text = msg.text;
             // For the latest user message, add the mood/rating context if it exists.
            if (msg.id === lastMessage.id && msg.sender === 'user' && msg.mood && msg.rating) {
                text = `The user is feeling ${msg.mood} (rated ${msg.rating}/5). They wrote: "${msg.text}"`;
            }
            return {
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text }]
            };
        });
        
        const response = await ai.models.generateContent({
            model,
            contents: conversationHistory,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API for diary response:", error);
        return language === 'hi-IN' 
            ? "माफ़ कीजिए, मुझे अभी सोचने में थोड़ी परेशानी हो रही है। कृपया थोड़ी देर में फिर से बताने का प्रयास करें।"
            : "I's sorry, I'm having a little trouble thinking right now. Please try telling me again in a moment.";
    }
};

export const transcribeAudio = async (base64AudioData: string, mimeType: string): Promise<string> => {
    try {
        const audioPart = {
            inlineData: {
                mimeType: mimeType,
                data: base64AudioData,
            },
        };
        
        const textPart = {
            text: "Transcribe this audio recording precisely."
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [audioPart, textPart] },
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for audio transcription:", error);
        throw new Error("Failed to transcribe audio.");
    }
};

const addReminderFunctionDeclaration: FunctionDeclaration = {
    name: 'addReminder',
    parameters: {
        type: Type.OBJECT,
        description: 'Schedules a medication reminder for a user on a specific date and time. Use this for any requests to create a reminder, such as "Remind me to take my pills at 8pm" or "Add a reminder for Paracetamol tomorrow morning".',
        properties: {
            title: {
                type: Type.STRING,
                description: 'The name of the medication or reminder. Example: "Metformin 500mg", "Heart pill", "Dolo tablet"',
            },
            date: {
                type: Type.STRING,
                description: 'The date for the reminder in YYYY-MM-DD format. Infer this from user input. If the user says "tonight" or "this evening", it\'s today. If they say "tomorrow", it\'s the next calendar date. If no date is mentioned, assume today.',
            },
            time: {
                type: Type.STRING,
                description: 'The time for the reminder in 24-hour HH:mm format. Infer this from user input (e.g., "9pm" is "21:00", "8:30 am" is "08:30").',
            },
            mealContext: {
                type: Type.STRING,
                description: 'Specifies if the medication should be taken before or after a meal. Infer this from the user\'s phrasing if available.',
                enum: ['Before Meal', 'After Meal'],
            },
        },
        required: ['title', 'date', 'time'],
    },
};

const navigateFunctionDeclaration = (availableViews: string[]): FunctionDeclaration => ({
    name: 'navigate',
    parameters: {
        type: Type.OBJECT,
        description: 'Navigates to a different page or view in the application.',
        properties: {
            view: {
                type: Type.STRING,
                description: 'The destination view to navigate to.',
                enum: availableViews,
            },
        },
        required: ['view'],
    },
});

const callSosFunctionDeclaration: FunctionDeclaration = {
    name: 'call_sos',
    parameters: {
        type: Type.OBJECT,
        description: 'Triggers an emergency SOS alert for the user. Only use if the user explicitly asks for help or mentions an emergency.',
        properties: {},
    },
};

const readRemindersFunctionDeclaration: FunctionDeclaration = {
    name: 'read_reminders',
    parameters: {
        type: Type.OBJECT,
        description: 'Reads the user\'s upcoming medication or appointment reminders aloud.',
        properties: {},
    },
};

const LOCALIZED_RESPONSES = {
    'en-US': {
        navigate: (view: string) => [`Sure, going to ${view} now.`, `Okay, opening the ${view} page.`],
        call_sos: () => ["Activating SOS now. Emergency alert triggered."],
        unknown: () => ["Sorry, I didn't understand that.", "I'm not sure how to help with that."],
    },
    'hi-IN': {
        navigate: (view: string) => [`ज़रूर, ${view} पर जा रहे हैं।`, `ठीक है, ${view} पेज खोल रहे हैं।`],
        call_sos: () => ["अभी एसओएस सक्रिय किया जा रहा है। आपातकालीन चेतावनी चालू हो गई है।"],
        unknown: () => ["माफ़ कीजिए, मैं यह समझ नहीं पाई।", "मैं इसमें आपकी मदद कैसे कर सकती हूँ, यह मुझे यकीन नहीं है।"],
    },
    'ta-IN': {
        navigate: (view: string) => [`நிச்சயமாக, இப்போது ${view}க்குச் செல்கிறேன்.`, `சரி, ${view} பக்கத்தைத் திறக்கிறேன்.`],
        call_sos: () => ["SOS இப்போது செயல்படுத்தப்படுகிறது. அவசர எச்சரிக்கை இயக்கப்பட்டது."],
        unknown: () => ["மன்னிக்கவும், எனக்கு அது புரியவில்லை.", "அதில் எப்படி உதவுவது என்று எனக்குத் தெரியவில்லை."],
    },
};

const getRandomResponse = (responses: string[]): string => responses[Math.floor(Math.random() * responses.length)];

export const getVoiceCommandAction = async (command: string, availableViews: string[], language: string, langName: string, role: 'patient' | 'doctor', currentUserId: string): Promise<VoiceAction> => {
    
    const tools: FunctionDeclaration[] = [navigateFunctionDeclaration(availableViews)];
    if (role === 'patient') {
        tools.push(addReminderFunctionDeclaration);
        tools.push(callSosFunctionDeclaration);
        tools.push(readRemindersFunctionDeclaration);
    }

    const systemInstruction = `You are a voice command assistant for a senior care app. The user is speaking ${langName}.
- Your primary goal is to understand the user's command and call the appropriate function.
- If the user asks to navigate, go to a page, or open a section, use the 'navigate' function.
- If the user wants to add, create, or set a reminder for medication (e.g., "Remind me to take my pill at 9 PM", "add a reminder for Dolo tablet at 8:30 AM"), you MUST use the 'addReminder' function.
- If the user explicitly asks for help, SOS, or mentions an emergency, use the 'call_sos' function.
- If the user asks to hear their reminders, use the 'read_reminders' function.
- If the command is a general question, a greeting, or something you cannot perform with a function, do NOT call any function. Instead, provide a short, helpful, conversational response in ${langName}.`;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: `User command: "${command}"`,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: tools }],
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        const responsesForLang = LOCALIZED_RESPONSES[language as keyof typeof LOCALIZED_RESPONSES] || LOCALIZED_RESPONSES['en-US'];

        if (result.functionCalls && result.functionCalls.length > 0) {
            const funcCall = result.functionCalls[0];
            
            switch (funcCall.name) {
                case 'addReminder': {
                    const { title, date, time, mealContext } = funcCall.args;
                    
                    let responseText = '';
                    if (language === 'hi-IN') {
                        responseText = `ठीक है, मैंने ${title} के लिए ${time} बजे का रिमाइंडर जोड़ दिया है।`;
                    } else if (language === 'ta-IN') {
                        responseText = `சரி, ${title}க்கு ${time} மணிக்கு நினைவூட்டலைச் சேர்த்துள்ளேன்.`;
                    } else {
                        const displayTime = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                        responseText = `Okay, I've added a reminder for ${title} at ${displayTime}.`;
                    }

                    return {
                        action: 'add_reminder',
                        payload: {
                            title: title as string,
                            date: date as string,
                            time: time as string,
                            mealContext: mealContext as 'Before Meal' | 'After Meal' | undefined,
                            patientId: currentUserId
                        },
                        response: responseText,
                    };
                }
                case 'navigate': {
                    const { view } = funcCall.args;
                    return {
                        action: 'navigate',
                        payload: view as string,
                        response: getRandomResponse(responsesForLang.navigate(view as string)),
                    };
                }
                case 'call_sos': {
                    return {
                        action: 'call_sos',
                        response: getRandomResponse(responsesForLang.call_sos()),
                    };
                }
                case 'read_reminders': {
                    return {
                        action: 'read_reminders',
                        response: '', // This will be generated in the component with actual reminder data
                    };
                }
            }
        }

        const naturalResponse = result.text.trim();
        return {
            action: naturalResponse ? 'answer_question' : 'unknown',
            response: naturalResponse || getRandomResponse(responsesForLang.unknown()),
        };
       
    } catch (error) {
        console.error("Error calling Gemini API for voice command:", error);
        throw new Error("API call for voice command failed.");
    }
};

export const getReminderAction = async (command: string, language: string, langName: string): Promise<ReminderAction> => {
    
    const systemInstruction = `You are a voice assistant inside a medication reminder alert. The user is currently being alerted for a medication. They can speak to you to add a new reminder or confirm they have taken the current medication. You are interacting in ${langName}.

Your tasks are:
1.  **Parse New Reminder Requests:** If the user asks to add a new reminder (e.g., "Also add a reminder for Paracetamol at 9 PM"), use the 'addReminder' tool to extract the medication name ('title'), date ('YYYY-MM-DD'), time (in HH:mm format), and meal context if provided.
2.  **Parse Confirmation:** If the user says something like "Okay, I've taken it" or "Done" or "हाँ, ले ली", you must not use the tool.
3.  **Handle Other Queries:** If the command is unclear, you must not use the tool.

- Infer the time accurately. "Tonight at 9" means "21:00". "Morning at 8" means "08:00".
- Infer the date. If not specified, assume today. "Tomorrow" is the next day.
`;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: `User command: "${command}"`,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: [addReminderFunctionDeclaration] }],
            },
        });

        if (result.functionCalls && result.functionCalls.length > 0) {
            const funcCall = result.functionCalls[0];
            if (funcCall.name === 'addReminder' && funcCall.args) {
                const { title, date, time, mealContext } = funcCall.args;
                
                let responseText = '';
                if (language === 'hi-IN') {
                    responseText = `ठीक है, मैंने ${title} के लिए ${time} बजे का रिमाइंडर जोड़ दिया है।`;
                } else {
                    const displayTime = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    responseText = `Okay, I've added a reminder for ${title} at ${displayTime}.`;
                }

                return {
                    action: 'add_reminder',
                    payload: {
                        title: title as string,
                        date: date as string,
                        time: time as string,
                        mealContext: mealContext as 'Before Meal' | 'After Meal' | undefined,
                    },
                    response: responseText,
                };
            }
        }
        
        const classificationSystemInstruction = `You are a command classifier for a reminder alert. Classify the user's command in ${langName} into 'confirm_taken' or 'unknown'. Respond ONLY with a JSON object.
- If the user says "Okay", "Done", "I took it", "हाँ, ले ली", etc., classify as 'confirm_taken'.
- Otherwise, classify as 'unknown'.
The 'response' field should be a natural language confirmation in ${langName}.`

        const classificationResponse = await ai.models.generateContent({
            model,
            contents: `User command: "${command}"`,
            config: {
                systemInstruction: classificationSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['confirm_taken', 'unknown']},
                        response: { type: Type.STRING }
                    },
                    required: ['action', 'response']
                }
            }
        });
        
        const jsonResult = JSON.parse(classificationResponse.text.trim());
        return {
            action: jsonResult.action,
            response: jsonResult.response,
        };

    } catch (error) {
        console.error("Error calling Gemini API for reminder action:", error);
        const response = language === 'hi-IN' 
            ? "माफ़ कीजिए, मैं समझ नहीं पाई। कृपया फिर से प्रयास करें।"
            : "I'm sorry, I didn't understand. Please try again.";
        return { action: 'unknown', response };
    }
};