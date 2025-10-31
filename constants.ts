import { UserDetails, Doctor, HealthRecord, Reminder, Article, CommunityPost, CommunityEvent, ChatConversation, View, MoodEntry } from './types';

export const PATIENT_USER_DETAILS: UserDetails = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    age: 72,
    profilePicUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
};

export const DOCTORS: Doctor[] = [
    {
        id: 'doc-1',
        name: 'Dr. Marcus Chen',
        specialty: 'Geriatrician',
        imageUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
        available: true,
        email: 'marcus.chen@clinic.com',
        phone: '0987654321',
    },
    {
        id: 'doc-2',
        name: 'Dr. Evelyn Reed',
        specialty: 'Cardiologist',
        imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        available: false,
        email: 'evelyn.reed@clinic.com',
        phone: '0987654322',
    },
    {
        id: 'doc-3',
        name: 'Dr. Ben Carter',
        specialty: 'Orthopedist',
        imageUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        available: true,
        email: 'ben.carter@clinic.com',
        phone: '0987654323',
    },
];

export const PATIENTS: UserDetails[] = [
    PATIENT_USER_DETAILS,
    {
        id: 'user-456',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '2345678901',
        age: 68,
        profilePicUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
    },
     {
        id: 'user-789',
        name: 'Peter Jones',
        email: 'peter.jones@example.com',
        phone: '3456789012',
        age: 75,
        profilePicUrl: 'https://randomuser.me/api/portraits/men/33.jpg',
    }
];


export const HEALTH_RECORDS: HealthRecord[] = [
    {
        id: 'hr-1',
        patientId: 'user-123',
        title: 'Annual Check-up Summary',
        type: 'Consultation Note',
        eventDate: '2024-07-15',
        uploadedAt: '2024-07-16T10:00:00Z',
    },
    {
        id: 'hr-2',
        patientId: 'user-123',
        title: 'Blood Test Results',
        type: 'Lab Report',
        eventDate: '2024-07-10',
        uploadedAt: '2024-07-11T14:30:00Z',
        fileName: 'blood_report_july.pdf',
    },
    {
        id: 'hr-3',
        patientId: 'user-123',
        title: 'Lisinopril Prescription',
        type: 'Prescription',
        eventDate: '2024-06-20',
        uploadedAt: '2024-06-20T09:15:00Z',
        fileName: 'lisinopril_rx.jpg',
    },
    {
        id: 'hr-7',
        patientId: 'user-123',
        title: 'Follow-up Note',
        type: 'Consultation Note',
        eventDate: '2024-05-01',
        uploadedAt: '2024-05-01T11:00:00Z',
    },
    {
        id: 'hr-4',
        patientId: 'user-456',
        title: 'Cardiology Follow-up',
        type: 'Consultation Note',
        eventDate: '2024-07-18',
        uploadedAt: '2024-07-18T11:00:00Z',
    },
    {
        id: 'hr-5',
        patientId: 'user-456',
        title: 'X-Ray Results - Wrist',
        type: 'Lab Report',
        eventDate: '2024-07-05',
        uploadedAt: '2024-07-06T16:00:00Z',
        fileName: 'xray_wrist_july.pdf'
    },
    {
        id: 'hr-6',
        patientId: 'user-789',
        title: 'Physical Therapy Notes',
        type: 'Consultation Note',
        eventDate: '2024-07-20',
        uploadedAt: '2024-07-20T15:00:00Z',
    }
];

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const todayStr = today.toISOString().split('T')[0];
const tomorrowStr = tomorrow.toISOString().split('T')[0];

export const INITIAL_REMINDERS: Reminder[] = [
    { id: 'rem-1', title: 'Metformin (500mg)', date: todayStr, time: '08:00', type: 'Medication', mealContext: 'After Meal', taken: false, patientId: 'user-123' },
    { id: 'rem-2', title: 'Atorvastatin (20mg)', date: todayStr, time: '20:00', type: 'Medication', mealContext: 'After Meal', taken: false, patientId: 'user-123' },
    { id: 'rem-3', title: 'Follow-up', date: tomorrowStr, time: 'Tomorrow, 11:00 AM', type: 'Appointment', patientId: 'user-123' },
    { id: 'rem-4', title: 'Routine Check-up', date: tomorrowStr, time: 'Tomorrow, 2:00 PM', type: 'Appointment', patientId: 'user-456' },
    { id: 'rem-5', title: 'Consultation', date: todayStr, time: 'Today, 4:30 PM', type: 'Appointment', patientId: 'user-789' }
];

export const ARTICLES: Article[] = [
    {
        id: 'art-1',
        title: 'Exercises for Elder People',
        category: 'Fitness',
        summary: 'Discover safe and effective exercises to improve strength, balance, and flexibility.',
        imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800',
        fullDescription: 'Staying active is crucial for healthy aging. This guide introduces a series of low-impact exercises that can be done at home, including chair yoga, walking, and light strength training, to help you stay fit and independent.',
        youtubeUrl: 'https://www.youtube.com/watch?v=xTjL9fuIYmo&list=PLRCgg2aTq5NWjbav8TVXatCRijJlwuU0M&index=2',
    },
    {
        id: 'art-2',
        title: 'AI-Powered Meal Analyzer',
        category: 'Nutrition',
        summary: 'Use our AI tool to analyze your meals and get instant feedback on your nutritional choices.',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800',
        contentType: 'interactiveNutrition',
        quickTips: [
            "Take a picture of your meal to get an instant health rating.",
            "Our AI provides personalized feedback to help you make better choices.",
            "Eating balanced meals is key to staying healthy and energetic."
        ],
        mealPlan: {
            breakfast: 'Oatmeal with berries and a handful of nuts.',
            lunch: 'Grilled chicken salad with a variety of greens and a light vinaigrette.',
            dinner: 'Baked salmon with steamed asparagus and quinoa.',
        }
    },
    {
        id: 'art-3',
        title: 'Yoga for Elderly People',
        category: 'Fitness',
        summary: 'Gentle yoga poses to improve flexibility, balance, and mental clarity for seniors.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
        fullDescription: 'Yoga is a wonderful way for seniors to maintain their physical and mental health. This session focuses on gentle, modified poses that can be done with the support of a chair, helping to improve joint mobility, enhance balance, and promote a sense of calm and well-being.',
        youtubeUrl: 'https://www.youtube.com/watch?v=0L_YrMcwU3w&list=PLJvDaXFqvSLOqmNzMoGOgKTxa1PqM1UIL&index=1',
    },
    {
        id: 'art-4',
        title: 'Nurturing Your Mental Wellness',
        category: 'Mental Wellness',
        summary: 'Discover simple practices to calm your mind, reduce stress, and improve your overall emotional well-being.',
        imageUrl: 'https://images.unsplash.com/photo-1547560893-af42353603c4?q=80&w=800',
        navigateToView: View.CommunityHub,
    },
    {
        id: 'art-5',
        title: 'Spiritual Wellness',
        category: 'Mental & Spiritual Wellness',
        summary: 'Find peace and comfort through spiritual readings and guided meditations.',
        imageUrl: 'https://images.unsplash.com/photo-1508213629007-1ea3c6c3e1e2?q=80&w=800',
        contentType: 'religious', // This triggers the special modal
        religiousBooks: [
            {
                title: 'The Bible',
                author: 'The Holy Bible',
                summary: 'Listen to passages from the Holy Bible, offering comfort, wisdom, and spiritual guidance.',
                youtubeUrl: 'https://youtube.com/playlist?list=PLLXWR4NrK0yn21RYTUQ1Ht--AYEi-2gLy&si=kBEy0MMQHcHA-JPA'
            },
            {
                title: 'Quran Recitation (Playlist)',
                author: 'The Holy Quran',
                summary: 'Listen to a playlist of beautiful recitations from the Holy Quran, offering spiritual guidance and peace.',
                youtubeUrl: 'https://www.youtube.com/watch?v=dXxh8tmUimc&list=PL3SWvPT2o0y-sytMGUdlbJX07_EtVtx4w'
            },
            {
                title: 'Quran Recitation (Single Video)',
                author: 'The Holy Quran',
                summary: 'Listen to another beautiful recitation for spiritual reflection and peace.',
                youtubeUrl: 'https://www.youtube.com/watch?v=oEFDyPhUb1M'
            },
            {
                title: 'Bhagavad Gita',
                author: 'Ancient Hindu Scripture',
                summary: 'Listen to the sacred teachings of the Bhagavad Gita, offering profound wisdom on life, duty, and spirituality.',
                youtubeUrl: 'https://www.youtube.com/playlist?list=PLX0Ub3o9M5sKqFKSRmYL6HUfs3YerzdTx'
            },
            {
                title: 'Ramayan',
                author: 'Ancient Hindu Epic',
                summary: 'Listen to the epic story of the Ramayan, a tale of dharma, righteousness, and devotion.',
                youtubeUrl: 'https://www.youtube.com/watch?v=tdImHCTNqUs&list=PLapw_oQeJSZ0xAnbHvPuX5ojj0sEIMKqK'
            }
        ]
    }
];

export const COMMUNITY_POSTS: CommunityPost[] = [
    {
        id: 'post1',
        author: 'Eleanor Vance',
        authorImageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
        timestamp: '2 hours ago',
        content: 'Just came back from a lovely morning walk in the park. The weather was perfect! ☀️',
        likes: 12,
        comments: [
            { id: 'c1', author: 'Arthur Harris', authorImageUrl: 'https://randomuser.me/api/portraits/men/67.jpg', timestamp: '1h ago', content: 'That sounds wonderful, Eleanor!', likes: 2, replies: [] }
        ],
    }
];

export const COMMUNITY_EVENTS: CommunityEvent[] = [
    {
        id: 'event1',
        title: 'Weekly Book Club',
        date: 'Wednesday, Aug 7',
        time: '2:00 PM',
        location: 'Community Center',
        attendees: 8,
        author: 'Admin'
    }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
    {
        id: 'convo-1',
        patientId: 'user-123',
        participantName: 'Dr. Marcus Chen',
        participantImageUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
        participantPhone: '0987654321',
        lastMessage: 'Great, see you then!',
        lastMessageTimestamp: 'Yesterday',
        messages: [
            { id: 'm1', text: 'Hi John, just a reminder about your appointment tomorrow at 11 AM.', isMe: false, timestamp: '10:30 AM' },
            { id: 'm2', text: 'Thanks, Dr. Chen. I will be there.', isMe: true, timestamp: '10:32 AM' },
            { id: 'm3', text: 'Great, see you then!', isMe: false, timestamp: '10:33 AM' },
        ],
    },
    {
        id: 'convo-2',
        patientId: 'user-456',
        participantName: 'Dr. Marcus Chen',
        participantImageUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
        participantPhone: '0987654321',
        lastMessage: 'I am feeling much better, thank you!',
        lastMessageTimestamp: '3 days ago',
        messages: [
             { id: 'm4', text: 'Hello Dr. Chen, just wanted to follow up on my prescription.', isMe: true, timestamp: '1:15 PM' },
             { id: 'm5', text: 'Hi Jane, of course. Everything should be at your pharmacy now.', isMe: false, timestamp: '1:20 PM' },
             { id: 'm6', text: 'I am feeling much better, thank you!', isMe: true, timestamp: '1:21 PM' },
        ],
    },
    {
        id: 'convo-3',
        patientId: 'user-789',
        participantName: 'Dr. Ben Carter',
        participantImageUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        participantPhone: '0987654323',
        lastMessage: 'Okay, I will try those exercises.',
        lastMessageTimestamp: '1 day ago',
        messages: [
             { id: 'm7', text: 'Hi Peter, how is the physical therapy going?', isMe: false, timestamp: '9:00 AM' },
             { id: 'm8', text: 'Okay, I will try those exercises.', isMe: true, timestamp: '9:05 AM' },
        ],
    }
];

export const INITIAL_MOOD_ENTRIES: MoodEntry[] = [
  {
    id: 'mood-1',
    patientId: 'user-123',
    mood: 'Happy',
    rating: 5,
    notes: 'Had a wonderful visit from my grandkids today! We played in the garden and they told me about school. It really lifted my spirits.',
    tags: ['family', 'joy', 'garden'],
    activities: ['Social'],
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mood-2',
    patientId: 'user-123',
    mood: 'Sad',
    rating: 2,
    notes: 'Feeling a bit lonely this afternoon. The house feels too quiet.',
    tags: ['loneliness', 'quiet'],
    activities: [],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mood-3',
    patientId: 'user-123',
    mood: 'Calm',
    rating: 4,
    notes: 'Listened to some classical music and did my breathing exercises. Feeling very peaceful and relaxed now.',
    tags: ['relaxation', 'music', 'meditation'],
    activities: ['Medication'],
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mood-4',
    patientId: 'user-123',
    mood: 'Stressed',
    rating: 1,
    notes: 'Worried about the upcoming doctor\'s appointment. My knee has been aching more than usual.',
    tags: ['anxiety', 'health', 'pain'],
    activities: ['Work'],
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mood-5',
    patientId: 'user-123',
    mood: 'Neutral',
    rating: 3,
    notes: 'A pretty standard day. Read the newspaper and took my medications on time.',
    tags: ['routine'],
    activities: ['Healthy Meal', 'Medication'],
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
    {
    id: 'mood-6',
    patientId: 'user-123',
    mood: 'Happy',
    rating: 4,
    notes: 'Went for a nice walk in the morning and the weather was perfect. Felt good to get some fresh air.',
    tags: ['weather', 'walk', 'morning'],
    activities: ['Exercise'],
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
