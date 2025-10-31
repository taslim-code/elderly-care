import React, { useState } from 'react';
import { Reminder, UserDetails } from '../types';
import TimePicker from './TimePicker';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  patients: UserDetails[];
  onSchedule: (reminder: Omit<Reminder, 'id' | 'type'>) => void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, selectedDate, patients, onSchedule }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients.length > 0 ? patients[0].id : '');
  const [time, setTime] = useState('10:00');
  const [title, setTitle] = useState('Consultation');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !time || !title.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    const appointmentDate = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes);

    const formattedTime = appointmentDate.toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
    
    const newAppointmentData: Omit<Reminder, 'id' | 'type'> = {
      title: title,
      time: formattedTime,
      patientId: selectedPatientId,
      date: selectedDate.toISOString().split('T')[0],
    };

    onSchedule(newAppointmentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full m-4 p-8 transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Appointment</h2>
        <p className="text-xl text-gray-600 mb-6">
          For: <span className="font-semibold text-teal-700">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="patient" className="block text-lg font-medium text-gray-700">Patient</label>
            <select
              id="patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            >
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">Appointment Type</label>
            <input 
              type="text" 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-lg font-medium text-gray-700">Time</label>
            <TimePicker value={time} onChange={setTime} />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700">Add Appointment</button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AddAppointmentModal;
