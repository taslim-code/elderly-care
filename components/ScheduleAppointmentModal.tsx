import React, { useState } from 'react';
import { Reminder, UserDetails } from '../types';
import { EnvelopeIcon, ChatBubbleIcon } from './icons/Icons';


interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: UserDetails;
  onSchedule: (reminder: Omit<Reminder, 'id' | 'type'>) => void;
  onSendMessage: (patientId: string, messageText: string) => void;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({ isOpen, onClose, patient, onSchedule, onSendMessage }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [error, setError] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Please select a valid date and time.');
      return;
    }
    setError('');

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
    
    const formattedTime = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });
    
    const reminderText = `This is a friendly reminder of your upcoming appointment for a Routine Check-up on ${formattedDate} at ${formattedTime}.`;

    if (sendEmail) {
        const subject = encodeURIComponent(`Appointment Reminder: Routine Check-up`);
        const body = encodeURIComponent(`Dear ${patient.name},\n\n${reminderText}\n\nBest regards,\nElderlyEase Clinic`);
        window.open(`mailto:${patient.email}?subject=${subject}&body=${body}`);
    }
    
    if (sendSms) {
        onSendMessage(patient.id, reminderText);
    }


    const newAppointmentData: Omit<Reminder, 'id' | 'type'> = {
      title: 'Routine Check-up',
      time: `${formattedDate}, ${formattedTime}`,
      patientId: patient.id,
      date: date,
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Schedule Appointment</h2>
        <p className="text-xl text-gray-600 mb-6">For: <span className="font-semibold text-teal-700">{patient.name}</span></p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">Appointment Type</label>
            <input 
              type="text" 
              id="title" 
              value="Routine Check-up" 
              disabled 
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg text-gray-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="date" className="block text-lg font-medium text-gray-700">Date</label>
              <input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" 
                required 
              />
            </div>
            <div className="flex-1">
              <label htmlFor="time" className="block text-lg font-medium text-gray-700">Time</label>
              <input 
                type="time" 
                id="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" 
                required 
              />
            </div>
          </div>
          
           <div>
              <label className="block text-lg font-medium text-gray-700">Notification Options</label>
              <div className="mt-2 space-y-3 rounded-md bg-gray-50 p-4 border">
                  <label className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={sendEmail} onChange={() => setSendEmail(!sendEmail)} className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      <span className="ml-3 text-md text-gray-700">Send Email Reminder</span>
                      <EnvelopeIcon className="h-5 w-5 ml-auto text-gray-400" />
                  </label>
                   <label className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={sendSms} onChange={() => setSendSms(!sendSms)} className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      <span className="ml-3 text-md text-gray-700">Send SMS (In-App Chat) Reminder</span>
                      <ChatBubbleIcon />
                  </label>
              </div>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700">Schedule</button>
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

export default ScheduleAppointmentModal;
