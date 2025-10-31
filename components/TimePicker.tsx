import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon } from './icons/Icons';

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (value: string) => void;
}

const generateTimeSlots = () => {
  const slots = [];
  // Clinic hours from 9 AM to 5 PM
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};

const formatTimeForDisplay = (time: string): string => {
  if (!time.includes(':')) {
    return "Invalid Time";
  }
  const [hour, minute] = time.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${minute} ${ampm}`;
};

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeSlots = generateTimeSlots();
  const pickerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll to selected time when opening
  useEffect(() => {
    if (isOpen && listRef.current) {
        const selectedElement = listRef.current.querySelector(`[data-time-value="${value}"]`);
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [isOpen, value]);

  const handleTimeSelect = (slot: string) => {
    onChange(slot);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 flex items-center justify-between w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
      >
        <span>{formatTimeForDisplay(value)}</span>
        <ClockIcon className="h-5 w-5 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
          <ul ref={listRef} className="py-1">
            {timeSlots.map(slot => (
              <li key={slot}>
                <button
                  type="button"
                  data-time-value={slot}
                  onClick={() => handleTimeSelect(slot)}
                  className={`w-full text-left px-4 py-2 text-lg transition-colors duration-150 ${value === slot ? 'bg-teal-100 text-teal-700 font-semibold' : 'text-gray-800 hover:bg-gray-50'}`}
                >
                  {formatTimeForDisplay(slot)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
