

import React, { useState, useEffect } from 'react';
import './index.css'; // Assuming Tailwind CSS is set up in index.css

import { View, DoctorView, UserDetails, Doctor, Reminder, HealthRecord, ChatConversation, ChatMessage } from './types';
import { PATIENT_USER_DETAILS, DOCTORS, INITIAL_REMINDERS, HEALTH_RECORDS, INITIAL_CONVERSATIONS, PATIENTS } from './constants';

import Sidebar from './components/Sidebar';
import DoctorSidebar from './components/DoctorSidebar';
import Modal from './components/Modal';
import AlarmModal from './components/AlarmModal';
import VoiceAssistant from './components/VoiceAssistant';

import DashboardPage from './pages/DashboardPage';
import ConsultationPage from './pages/ConsultationPage';
import RecordsPage from './pages/RecordsPage';
import RemindersPage from './pages/RemindersPage';
import WellnessPage from './pages/WellnessPage';
import EducationPage from './pages/EducationPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import CommunityHubPage from './pages/CommunityHubPage';
import ChatsPage from './pages/ChatsPage';
import ProfilePage from './pages/ProfilePage';
import MusicPage from './pages/MusicPage';

import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import DoctorLoginPage from './pages/DoctorLoginPage';

import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorRecordsPage from './pages/DoctorRecordsPage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';


const App: React.FC = () => {
    const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
    const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
    
    // Patient states
    const [activeView, setActiveView] = useState<View>(View.Dashboard);
    const [isSosModalOpen, setIsSosModalOpen] = useState(false);
    const [alarmReminder, setAlarmReminder] = useState<Reminder | null>(null);

    // Doctor states
    const [activeDoctorView, setActiveDoctorView] = useState<DoctorView>(DoctorView.Dashboard);

    // Shared states
    const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(HEALTH_RECORDS);
    const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);

    // Reminder Alarm Logic
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const dueReminder = reminders.find(r => r.time === currentTime && !r.taken && r.type === 'Medication');
            if (dueReminder) {
                setAlarmReminder(dueReminder);
            }
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [reminders]);


    const handlePatientLogin = (details: Omit<UserDetails, 'profilePicUrl' | 'id'>) => {
        setCurrentUser({
            ...details,
            id: 'user-123',
            profilePicUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        });
    };
    
    const handleDoctorLogin = (doctor: Doctor) => {
        setCurrentDoctor(doctor);
    };

    const handleUpdateProfilePic = (newPicUrl: string) => {
        if (currentUser) {
            setCurrentUser({ ...currentUser, profilePicUrl: newPicUrl });
        }
    };
    
    // Reminder handlers
    const handleAddReminder = (newReminderData: Omit<Reminder, 'id'|'type'>) => {
        const newReminder: Reminder = {
            ...newReminderData,
            id: `rem-${Date.now()}`,
            type: 'Medication',
        };
        setReminders(prev => [newReminder, ...prev]);
    };
    
    const handleDeleteReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };

    const handleMarkAsTaken = (id: string) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, taken: true } : r));
        if (alarmReminder?.id === id) {
            setAlarmReminder(null);
        }
    };
    
    // Health Record Handler
    const handleAddHealthRecord = (recordData: Omit<HealthRecord, 'id' | 'uploadedAt'>) => {
        const newRecord: HealthRecord = {
          ...recordData,
          id: `hr-${Date.now()}`,
          uploadedAt: new Date().toISOString(),
        };
        setHealthRecords(prev => [newRecord, ...prev]);
    };
    
    // Doctor specific handlers
    const handleScheduleAppointment = (newAppointmentData: Omit<Reminder, 'id'|'type'>) => {
        const newAppointment: Reminder = {
            ...newAppointmentData,
            id: `rem-${Date.now()}`,
            type: 'Appointment',
        };
        setReminders(prev => [newAppointment, ...prev]);
    };
    
    const handleDoctorSendMessage = (patientId: string, messageText: string) => {
        const convoIndex = conversations.findIndex(c => c.patientId === patientId);
        if (convoIndex === -1 || !currentDoctor) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
        };
        
        const updatedConversations = [...conversations];
        const targetConvo = updatedConversations[convoIndex];
        targetConvo.messages = [...targetConvo.messages, newMessage];
        targetConvo.lastMessage = messageText;
        targetConvo.lastMessageTimestamp = 'Just now';

        setConversations(updatedConversations);
    };


    const renderPatientView = () => {
        if (!currentUser) {
            return <LoginPage onLogin={handlePatientLogin} />;
        }

        let content;
        switch (activeView) {
            case View.Dashboard:
                content = <DashboardPage setActiveView={setActiveView} userName={currentUser.name.split(' ')[0]} />;
                break;
            case View.Consultation:
                content = <ConsultationPage />;
                break;
            case View.HealthRecords:
                content = <RecordsPage 
                    healthRecords={healthRecords.filter(hr => hr.patientId === currentUser.id)} 
                    onAddRecord={handleAddHealthRecord}
                    patientId={currentUser.id}
                />;
                break;
            case View.Reminders:
                // FIX: Pass the patientId to the RemindersPage component.
                content = <RemindersPage reminders={reminders.filter(r => r.patientId === currentUser.id)} onAddReminder={handleAddReminder} onDeleteReminder={handleDeleteReminder} onMarkAsTaken={handleMarkAsTaken} patientId={currentUser.id} />;
                break;
            case View.Wellness:
                content = <WellnessPage setActiveView={setActiveView} userName={currentUser.name.split(' ')[0]} />;
                break;
            case View.Education:
                content = <EducationPage setActiveView={setActiveView} />;
                break;
            case View.SymptomChecker:
                content = <SymptomCheckerPage />;
                break;
            case View.CommunityHub:
                content = <CommunityHubPage userDetails={currentUser} />;
                break;
            case View.Chats:
                content = <ChatsPage conversations={conversations.filter(c => c.patientId === currentUser.id)} setConversations={setConversations} currentUserId={currentUser.id} />;
                break;
            case View.Profile:
                content = <ProfilePage user={currentUser} onUpdateProfilePic={handleUpdateProfilePic} />;
                break;
            case View.Music:
                content = <MusicPage />;
                break;
            default:
                content = <DashboardPage setActiveView={setActiveView} userName={currentUser.name.split(' ')[0]} />;
        }
        
        const patientViews = Object.values(View);

        return (
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar activeView={activeView} setActiveView={setActiveView} onSosClick={() => setIsSosModalOpen(true)} userDetails={currentUser} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {content}
                </main>
                 <VoiceAssistant 
                    role="patient"
                    // FIX: Cast setActiveView to the type expected by VoiceAssistant.
                    // The component's logic ensures that only a `View` enum member will be passed in this context.
                    setActiveView={setActiveView as (view: View | DoctorView) => void}
                    onSosClick={() => setIsSosModalOpen(true)}
                    reminders={reminders}
                    userName={currentUser.name.split(' ')[0]}
                    availableViews={patientViews}
                    currentUserId={currentUser.id}
                />
                <Modal 
                    isOpen={isSosModalOpen} 
                    onClose={() => setIsSosModalOpen(false)}
                    title="SOS Alert Triggered"
                    description="Your emergency contacts and nearest medical services have been notified. Help is on the way."
                />
                <AlarmModal
                    reminder={alarmReminder}
                    onMarkAsTaken={handleMarkAsTaken}
                />
            </div>
        );
    };

    const renderDoctorView = () => {
        if (!currentDoctor) {
            return <DoctorLoginPage onLogin={handleDoctorLogin} />;
        }

        let content;
        switch (activeDoctorView) {
            case DoctorView.Dashboard:
                content = <DoctorDashboardPage doctor={currentDoctor} reminders={reminders} onScheduleAppointment={handleScheduleAppointment} onSendMessage={handleDoctorSendMessage} />;
                break;
            case DoctorView.Patients:
                content = <DoctorRecordsPage 
                    healthRecords={healthRecords} 
                    patients={PATIENTS} 
                    reminders={reminders}
                    conversations={conversations}
                    doctor={currentDoctor} 
                    onAddHealthRecord={handleAddHealthRecord}
                />;
                break;
            case DoctorView.Schedule:
                 content = <DoctorSchedulePage doctor={currentDoctor} reminders={reminders} patients={PATIENTS} onScheduleAppointment={handleScheduleAppointment} onDeleteAppointment={handleDeleteReminder} />;
                 break;
            case DoctorView.Chats:
                 content = <ChatsPage conversations={conversations} setConversations={setConversations} currentUserId={currentDoctor.id} />;
                 break;
            case DoctorView.Music:
                 content = <MusicPage />;
                 break;
            case DoctorView.Profile:
                 content = <div className="text-3xl font-bold">Doctor Profile Page (Not Implemented)</div>;
                 break;
            default:
                content = <DoctorDashboardPage doctor={currentDoctor} reminders={reminders} onScheduleAppointment={handleScheduleAppointment} onSendMessage={handleDoctorSendMessage} />;
        }
        
        const doctorViews = Object.values(DoctorView);
        
        return (
             <div className="flex h-screen bg-gray-100 font-sans">
                <DoctorSidebar activeView={activeDoctorView} setActiveView={setActiveDoctorView} doctorDetails={currentDoctor} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {content}
                </main>
                <VoiceAssistant
                    role="doctor"
                    // FIX: Cast setActiveDoctorView to the type expected by VoiceAssistant.
                    // The component's logic ensures that only a `DoctorView` enum member will be passed in this context.
                    setActiveView={setActiveDoctorView as (view: View | DoctorView) => void}
                    onSosClick={() => {}} // SOS is patient-only, handled in component
                    reminders={reminders}
                    userName={currentDoctor.name.split(' ')[0]}
                    availableViews={doctorViews}
                    currentUserId={currentDoctor.id}
                />
            </div>
        )
    };

    if (!role) {
        return <RoleSelectionPage onSelectRole={setRole} />;
    }

    if (role === 'patient') {
        return renderPatientView();
    }

    if (role === 'doctor') {
        return renderDoctorView();
    }
    
    return null; // Should not happen
};

export default App;