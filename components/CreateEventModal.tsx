import React, { useState } from 'react';
import type { CommunityEvent } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<CommunityEvent, 'id' | 'attendees' | 'author'>) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location) return;
    onAddEvent({ title, date, time, location, description });
    onClose();
    setTitle(''); setDate(''); setTime(''); setLocation(''); setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full m-4 p-8 transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Create a New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">Event Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="date" className="block text-lg font-medium text-gray-700">Date</label>
              <input type="text" id="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g., Sunday, Aug 4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
            </div>
            <div className="flex-1">
              <label htmlFor="time" className="block text-lg font-medium text-gray-700">Time</label>
              <input type="text" id="time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., 10:00 AM" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-lg font-medium text-gray-700">Location</label>
            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700">Create Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
