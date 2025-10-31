

import React from 'react';
import { DoctorView, Doctor } from '../types';
import { HomeIcon, UsersIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, LifeBuoyIcon, MusicIcon, ArrowLeftOnRectangleIcon } from './icons/Icons';

interface DoctorSidebarProps {
  activeView: DoctorView;
  setActiveView: (view: DoctorView) => void;
  doctorDetails: Doctor;
  onLogout: () => void;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ activeView, setActiveView, doctorDetails, onLogout }) => {
  const navItems = [
    { view: DoctorView.Dashboard, icon: <HomeIcon /> },
    { view: DoctorView.Patients, icon: <UsersIcon /> },
    { view: DoctorView.Schedule, icon: <CalendarDaysIcon /> },
    { view: DoctorView.Chats, icon: <ChatBubbleLeftRightIcon /> },
    { view: DoctorView.Music, icon: <MusicIcon /> },
  ];

  return (
    <div className="w-24 lg:w-64 bg-white shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center lg:justify-start p-4 lg:p-6 border-b">
          <LifeBuoyIcon />
          <h1 className="hidden lg:block text-2xl font-bold text-teal-600 ml-3">Doctor Portal</h1>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.view} className="px-3 lg:px-4 my-1">
                <button
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center justify-center lg:justify-start py-3 px-3 rounded-lg text-lg transition-colors duration-200 ${
                    activeView === item.view
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:inline-block ml-4">{item.view}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => setActiveView(DoctorView.Profile)}
          className="w-full flex items-center p-2 rounded-lg bg-gray-100 hover:bg-teal-100 transition-colors text-left"
        >
            <img src={doctorDetails.imageUrl} alt={doctorDetails.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="hidden lg:block ml-3">
                <p className="font-semibold text-gray-800">{doctorDetails.name}</p>
                <p className="text-sm text-gray-500">{doctorDetails.specialty}</p>
            </div>
        </button>
        <button
          onClick={onLogout}
          className="w-full mt-4 flex items-center justify-center lg:justify-start text-left text-gray-600 hover:bg-gray-100 hover:text-gray-800 py-3 px-3 rounded-lg text-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon />
          <span className="hidden lg:inline-block ml-4">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
