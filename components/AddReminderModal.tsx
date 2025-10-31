import React, { useState } from 'react';
import type { Reminder } from '../types';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'type'>) => void;
  patientId: string;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({ isOpen, onClose, onAddReminder, patientId }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [duration, setDuration] = useState('');
  const [mealContext, setMealContext] = useState<'Before Meal' | 'After Meal'>('After Meal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        setError('Please enter a medication name.');
        return;
    }
    setError('');
    onAddReminder({ title, date, time, duration, mealContext, patientId });
    onClose();
    // Reset form
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('08:00');
    setDuration('');
    setMealContext('After Meal');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full m-4 p-8 transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Medication Reminder</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">Medication Name</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Metformin (500mg)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
           <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor="date" className="block text-lg font-medium text-gray-700">Date</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
                </div>
                <div className="flex-1">
                    <label htmlFor="time" className="block text-lg font-medium text-gray-700">Time</label>
                    <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
                </div>
           </div>

          <div>
            <label htmlFor="duration" className="block text-lg font-medium text-gray-700">Duration (Optional)</label>
            <input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., For 14 days" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">Instructions</label>
            <div className="mt-2 flex space-x-4">
                 <label className="flex-1">
                    <input type="radio" value="Before Meal" checked={mealContext === 'Before Meal'} onChange={() => setMealContext('Before Meal')} className="sr-only peer" />
                    <div className="w-full p-3 text-center text-lg rounded-lg border-2 peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-checked:font-bold peer-checked:text-teal-700 cursor-pointer">
                        Before Meal
                    </div>
                </label>
                 <label className="flex-1">
                    <input type="radio" value="After Meal" checked={mealContext === 'After Meal'} onChange={() => setMealContext('After Meal')} className="sr-only peer" />
                     <div className="w-full p-3 text-center text-lg rounded-lg border-2 peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-checked:font-bold peer-checked:text-teal-700 cursor-pointer">
                        After Meal
                    </div>
                </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700">Add Reminder</button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddReminderModal;
