import React, { useState, useMemo } from 'react';
import { Doctor, Reminder, UserDetails } from '../types';
import { PATIENTS } from '../constants';
// FIX: Add UsersIcon to imports to fix reference error.
import { ClockIcon, EnvelopeIcon, PhoneIcon, ChatBubbleIcon, UsersIcon, MusicalNoteIcon } from '../components/icons/Icons';
import DashboardCard from '../components/DashboardCard';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal';


interface DoctorDashboardPageProps {
  doctor: Doctor;
  reminders: Reminder[];
  onScheduleAppointment: (newAppointmentData: Omit<Reminder, 'id'|'type'>) => void;
  onSendMessage: (patientId: string, messageText: string) => void;
}

const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({ doctor, reminders, onScheduleAppointment, onSendMessage }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<UserDetails | null>(null);

    const appointmentsToday = useMemo(() => {
        // A simple way to filter for "today" or "tomorrow" based on string content for demo
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return reminders.filter(r => r.type === 'Appointment' && (r.time.toLowerCase().includes('today') || r.time.toLowerCase().includes(today.toLowerCase()) || r.time.toLowerCase().includes('tomorrow')));
    }, [reminders]);

    const findPatientById = (patientId: string) => PATIENTS.find(p => p.id === patientId);

    const handleOpenScheduler = (patient: UserDetails) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };
    
    const handleSendEmail = (patient: UserDetails) => {
        const subject = encodeURIComponent("Follow-up from your recent visit");
        const body = encodeURIComponent(`Dear ${patient.name},\n\nI hope you are doing well.\n\nPlease let me know if you have any questions.\n\nBest regards,\n${doctor.name}`);
        window.location.href = `mailto:${patient.email}?subject=${subject}&body=${body}`;
    };

    const handleSendMessageClick = (patient: UserDetails) => {
        const message = prompt(`Enter message for ${patient.name}:`, `Hi ${patient.name}, this is a reminder about our upcoming appointment.`);
        if (message && message.trim()) {
            onSendMessage(patient.id, message.trim());
            alert("Message sent!");
        }
    };

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Welcome back, {doctor.name}</h2>
                <p className="text-2xl text-gray-500 mt-2">Here's your summary for today.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointments Section */}
                <div className="lg:col-span-2">
                    <DashboardCard title="Upcoming Appointments" icon={<ClockIcon className="h-8 w-8"/>} className="h-full">
                        <div className="space-y-4">
                            {appointmentsToday.length > 0 ? appointmentsToday.map(app => {
                                const patient = app.patientId ? findPatientById(app.patientId) : null;
                                return (
                                    <div key={app.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{patient ? patient.name : app.title}</p>
                                            <p className="text-md text-gray-600">{patient ? app.title : 'General Appointment'}</p>
                                            <p className="text-md font-semibold text-teal-600">{app.time}</p>
                                        </div>
                                        {patient && (
                                            <div className="flex items-center space-x-2">
                                                <button type="button" onClick={() => window.location.href = `tel:${patient.phone}`} className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200" title={`Call ${patient.name}`}><PhoneIcon className="h-5 w-5"/></button>
                                                <button type="button" onClick={() => handleSendMessageClick(patient)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200" title={`Send message to ${patient.name}`}><ChatBubbleIcon /></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : <p className="text-center text-gray-500 py-8">No appointments scheduled for today or tomorrow.</p>}
                        </div>
                    </DashboardCard>
                </div>

                {/* Patient List */}
                <div className="lg:col-span-1">
                    <DashboardCard title="My Patients" icon={<UsersIcon />} className="h-full">
                         <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                             {PATIENTS.map(patient => (
                                <div key={patient.id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                                    <div className="flex items-center">
                                        <img src={patient.profilePicUrl} alt={patient.name} className="w-10 h-10 rounded-full mr-3" />
                                        <div>
                                            <p className="font-bold text-md text-gray-800">{patient.name}</p>
                                            <p className="text-sm text-gray-500">Age: {patient.age}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                       <button type="button" onClick={() => handleOpenScheduler(patient)} className="p-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm font-semibold" title={`Schedule for ${patient.name}`}>Schedule</button>
                                       <button type="button" onClick={() => handleSendMessageClick(patient)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200" title={`Send message to ${patient.name}`}><ChatBubbleIcon /></button>
                                       <button type="button" onClick={() => handleSendEmail(patient)} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200" title={`Send email to ${patient.name}`}><EnvelopeIcon className="h-5 w-5" /></button>
                                    </div>
                                </div>
                             ))}
                         </div>
                    </DashboardCard>
                </div>
            </div>
            <div className="mt-8">
                <DashboardCard
                    title="Relaxing Music"
                    icon={<MusicalNoteIcon className="h-8 w-8"/>}
                    onClick={() => window.open('https://www.youtube.com/watch?v=eTucXMU8ctw&list=RDeTucXMU8ctw&index=1', '_blank')}
                >
                     <p className="text-lg text-gray-700">Take a break and unwind with a curated playlist of calming songs.</p>
                </DashboardCard>
            </div>
            {selectedPatient && (
                 <ScheduleAppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    patient={selectedPatient}
                    onSchedule={onScheduleAppointment}
                    onSendMessage={onSendMessage}
                />
            )}
        </div>
    );
};

export default DoctorDashboardPage;
