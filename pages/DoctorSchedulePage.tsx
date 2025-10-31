
import React, { useState, useMemo } from 'react';
import { Doctor, Reminder, UserDetails } from '../types';
import { PATIENTS } from '../constants';
import { ClockIcon, UserIcon, PlusIcon, XCircleIcon } from '../components/icons/Icons';
import AddAppointmentModal from '../components/AddAppointmentModal';

// Helper functions for date manipulation
const getWeekStartDate = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday to make Monday the start
  return new Date(d.setDate(diff));
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const parseAppointmentDate = (timeString: string): Date | null => {
    let baseDate = new Date();
    baseDate.setHours(0,0,0,0);
    let timeStr = timeString;

    if (timeString.toLowerCase().startsWith('tomorrow')) {
        baseDate.setDate(baseDate.getDate() + 1);
        timeStr = timeString.split(', ')[1];
    } else if (timeString.toLowerCase().startsWith('today')) {
        timeStr = timeString.split(', ')[1];
    }
    
    if (timeString.toLowerCase().startsWith('tomorrow') || timeString.toLowerCase().startsWith('today')) {
         try {
            const [time, modifier] = timeStr.split(' ');
            let [hoursStr, minutesStr] = time.split(':');
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);

            if (modifier.toLowerCase() === 'pm' && hours < 12) {
                hours += 12;
            }
            if (modifier.toLowerCase() === 'am' && hours === 12) { // Midnight case
                hours = 0;
            }
            baseDate.setHours(hours, minutes, 0, 0);
            return baseDate;
        } catch (e) {
            return baseDate;
        }
    }

    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null;
};


interface DoctorSchedulePageProps {
  doctor: Doctor;
  reminders: Reminder[];
  patients: UserDetails[];
  onScheduleAppointment: (newAppointmentData: Omit<Reminder, 'id'|'type'>) => void;
  onDeleteAppointment: (id: string) => void;
}

const DoctorSchedulePage: React.FC<DoctorSchedulePageProps> = ({ reminders, patients, onScheduleAppointment, onDeleteAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const weekStartDate = getWeekStartDate(currentDate);

    const appointmentsByDay = useMemo(() => {
        const appointments = reminders
            .filter(r => r.type === 'Appointment')
            .map(app => ({
                ...app,
                date: parseAppointmentDate(app.time),
                patient: PATIENTS.find(p => p.id === app.patientId),
            }))
            .filter(app => app.date !== null)
            .sort((a, b) => a.date!.getTime() - b.date!.getTime());

        const grouped: { [key: string]: typeof appointments } = {};
        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(weekStartDate, i);
            const dayKey = dayDate.toISOString().split('T')[0];
            grouped[dayKey] = appointments.filter(app => isSameDay(app.date!, dayDate));
        }
        return grouped;
    }, [reminders, weekStartDate]);

    const changeWeek = (direction: 'prev' | 'next') => {
        const newDate = addDays(currentDate, direction === 'prev' ? -7 : 7);
        setCurrentDate(newDate);
    };
    
    const handleOpenModal = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };
    
    const handleDelete = (appointmentId: string, patientName: string | undefined) => {
        if (window.confirm(`Are you sure you want to delete the appointment for ${patientName || 'this patient'}?`)) {
            onDeleteAppointment(appointmentId);
        }
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
    const weekFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' });
    const yearFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric' });

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Your Schedule</h2>
                <p className="text-2xl text-gray-500 mt-2">Manage your upcoming appointments for the week.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeWeek('prev')} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">&larr; Prev Week</button>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
                        {weekFormatter.format(weekStartDate)} - {weekFormatter.format(addDays(weekStartDate, 6))}, {yearFormatter.format(weekStartDate)}
                    </h3>
                    <button onClick={() => changeWeek('next')} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Next Week &rarr;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {weekDays.map(day => {
                        const dayKey = day.toISOString().split('T')[0];
                        const dayAppointments = appointmentsByDay[dayKey] || [];
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div key={dayKey} className={`rounded-lg p-3 flex flex-col ${isToday ? 'bg-teal-50 border-2 border-teal-200' : 'bg-gray-50'}`}>
                                <div className="text-left mb-3">
                                    <p className={`font-bold ${isToday ? 'text-teal-700' : 'text-gray-700'}`}>
                                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                    <p className={`text-2xl font-bold ${isToday ? 'text-teal-700' : 'text-gray-700'}`}>
                                        {day.getDate()}
                                    </p>
                                </div>
                                <div className="space-y-2 flex-grow">
                                    {dayAppointments.length > 0 ? (
                                        dayAppointments.map(app => (
                                            <div key={app.id} className="bg-white p-3 rounded-md shadow transition-shadow hover:shadow-md relative group">
                                                <button 
                                                    onClick={() => handleDelete(app.id, app.patient?.name)}
                                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                    title="Delete Appointment"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                                <p className="font-semibold text-gray-800 text-sm flex items-center pr-4">
                                                    <ClockIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                                    {app.date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                                <p className="font-medium text-teal-700 text-sm mt-1 flex items-center pr-4">
                                                    <UserIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate">{app.patient?.name || 'N/A'}</span>
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-400 text-sm pt-4 h-full flex items-center justify-center">No appointments</div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleOpenModal(day)} 
                                    className="mt-2 w-full flex items-center justify-center text-sm font-semibold text-gray-500 hover:text-teal-700 hover:bg-teal-100 py-2 rounded-md transition-colors"
                                    title="Add Appointment"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
             {selectedDate && (
                <AddAppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    patients={patients}
                    onSchedule={onScheduleAppointment}
                />
            )}
        </div>
    );
};

export default DoctorSchedulePage;
