import React, { useState } from 'react';
import type { Reminder } from '../types';
import { PlusIcon, ClockIcon, CalendarIcon, PillIcon, TrashIcon } from '../components/icons/Icons';
import AddReminderModal from '../components/AddReminderModal';

interface RemindersPageProps {
  reminders: Reminder[];
  onAddReminder: (newReminderData: Omit<Reminder, 'id' | 'type'>) => void;
  onDeleteReminder: (id: string) => void;
  onMarkAsTaken: (id: string) => void;
  patientId: string;
}

const RemindersPage: React.FC<RemindersPageProps> = ({ reminders, onAddReminder, onDeleteReminder, onMarkAsTaken, patientId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const sortedReminders = [...reminders].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return dateA - dateB;
    });

    return (
        <div>
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h2 className="text-5xl font-bold text-gray-800">Reminders & Alerts</h2>
                    <p className="text-2xl text-gray-500 mt-2">Stay on top of your medications and appointments.</p>
                </div>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-teal-700 transition-colors"
                >
                    <PlusIcon className="h-6 w-6 mr-2" />
                    Add New Reminder
                </button>
            </header>
            
            <div className="space-y-6">
                {sortedReminders.length > 0 ? sortedReminders.map(reminder => (
                    <div key={reminder.id} className={`bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all hover:shadow-xl ${reminder.taken ? 'opacity-60 bg-gray-50' : ''}`}>
                        <div className="flex items-center">
                            <div className={`p-4 rounded-full ${reminder.type === 'Medication' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                {reminder.type === 'Medication' ? <PillIcon /> : <CalendarIcon />}
                            </div>
                            <div className="ml-6">
                                <p className="text-2xl font-bold text-gray-800">{reminder.title}</p>
                                <div className="flex items-center text-lg text-gray-600 mt-1 space-x-4 flex-wrap">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 mr-2" />
                                        <span>{reminder.date === today ? 'Today' : new Date(reminder.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                                    </div>
                                    <span className="text-gray-400">|</span>
                                    <div className="flex items-center">
                                        <ClockIcon className="h-5 w-5 mr-2" />
                                        <span>{reminder.type === 'Medication' ? new Date(`1970-01-01T${reminder.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : reminder.time}</span>
                                    </div>
                                    {reminder.duration && <span className="text-gray-400">|</span>}
                                    {reminder.duration && <p>{reminder.duration}</p>}
                                    {reminder.mealContext && <span className="text-gray-400">|</span>}
                                    {reminder.mealContext && (
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                            reminder.mealContext === 'Before Meal' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {reminder.mealContext}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             {reminder.type === 'Medication' && (
                                <button 
                                    onClick={() => onMarkAsTaken(reminder.id)}
                                    disabled={reminder.taken}
                                    className="py-3 px-6 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 text-lg disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    {reminder.taken ? 'Taken ✓' : 'Mark as Taken'}
                                </button>
                             )}
                             <button 
                                onClick={() => onDeleteReminder(reminder.id)}
                                className="p-3 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                                title="Delete Reminder"
                            >
                                <TrashIcon />
                             </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <p className="text-2xl font-semibold text-gray-500">No reminders yet.</p>
                        <p className="text-lg text-gray-400 mt-2">Click "Add New Reminder" to get started!</p>
                    </div>
                )}
            </div>

            <AddReminderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddReminder={onAddReminder}
                patientId={patientId}
            />
        </div>
    );
};

export default RemindersPage;
