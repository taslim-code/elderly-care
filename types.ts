// FIX: Removed circular and conflicting import of 'View' from its own declaration file.
export enum View {
  Dashboard = 'Dashboard',
  Consultation = 'Consultation',
  HealthRecords = 'Health Records',
  Reminders = 'Reminders',
  Wellness = 'Echo Journal',
  Education = 'Education',
  SymptomChecker = 'Symptom Checker',
  CommunityHub = 'Community Hub',
  Chats = 'Chats',
  Profile = 'Profile',
  Music = 'Music',
}

export enum DoctorView {
  Dashboard = 'Dashboard',
  Patients = 'Patients',
  Schedule = 'Schedule',
  Chats = 'Chats',
  Profile = 'Profile',
  Music = 'Music',
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  profilePicUrl: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  available: boolean;
  email: string;
  phone: string;
}

export type ReminderType = 'Medication' | 'Appointment';
export type MealContext = 'Before Meal' | 'After Meal';

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm for medication, descriptive for appointments
  type: ReminderType;
  mealContext?: MealContext;
  duration?: string;
  taken?: boolean;
  patientId: string;
}

export type HealthRecordType = 'Consultation Note' | 'Lab Report' | 'Prescription';

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  type: HealthRecordType;
  eventDate: string;
  uploadedAt: string;
  fileName?: string;
  fileData?: string; // base64 encoded file
}

export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string;
  fullDescription?: string;
  youtubeUrl?: string;
  navigateToView?: View;
  contentType?: 'standard' | 'interactiveNutrition' | 'religious';
  quickTips?: string[];
  mealPlan?: {
      breakfast: string;
      lunch: string;
      dinner: string;
  };
  religiousBooks?: {
      title: string;
      author: string;
      summary: string;
      youtubeUrl: string;
  }[];
}

export interface Comment {
    id: string;
    author: string;
    authorImageUrl: string;
    timestamp: string;
    content: string;
    likes: number;
    replies: Comment[];
}

export interface CommunityPost {
    id: string;
    author: string;
    authorImageUrl: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: Comment[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    edited?: boolean;
}

export interface CommunityEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    description?: string;
    author: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatConversation {
  id: string;
  patientId: string;
  participantName: string;
  participantImageUrl: string;
  participantPhone?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  messages: ChatMessage[];
}

export type Mood = 'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Stressed';

export interface DiaryMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    fileName?: string;
    mood?: Mood;
    rating?: number;
}

export interface WellnessSuggestions {
    songs: { title: string; artist: string }[];
    books: { title: string; author: string }[];
}

export interface MoodEntry {
  id: string;
  patientId: string;
  mood: Mood;
  rating: number; // 1-5
  notes: string;
  tags: string[];
  activities: string[];
  timestamp: string;
}

export interface VoiceAction {
  action: 'navigate' | 'call_sos' | 'read_reminders' | 'answer_question' | 'unknown' | 'add_reminder';
  payload?: string | { title: string; date: string; time: string; mealContext?: 'Before Meal' | 'After Meal', patientId: string };
  response: string;
}

export interface ReminderAction {
    action: 'add_reminder' | 'confirm_taken' | 'unknown';
    payload?: {
        title: string;
        date: string;
        time: string;
        mealContext?: 'Before Meal' | 'After Meal';
    };
    response: string;
}