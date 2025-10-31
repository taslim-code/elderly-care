

import React from 'react';
// FIX: Corrected import path which will be resolved by the new types.ts file.
import { View, UserDetails } from '../types';
// FIX: Added MusicIcon to imports, which is now exported from Icons.tsx.
import { HomeIcon, StethoscopeIcon, ClipboardIcon, BellIcon, SparklesIcon, BookOpenIcon, CpuIcon, LifeBuoyIcon, ChatBubbleLeftRightIcon, UsersIcon, MusicIcon, ArrowLeftOnRectangleIcon } from './icons/Icons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onSosClick: () => void;
  userDetails: UserDetails;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onSosClick, userDetails, onLogout }) => {
  const navItems = [
    { view: View.Dashboard, icon: <HomeIcon /> },
    { view: View.Consultation, icon: <StethoscopeIcon /> },
    { view: View.HealthRecords, icon: <ClipboardIcon /> },
    { view: View.Reminders, icon: <BellIcon /> },
    // FIX: Changed View.Journal to View.Wellness to align with the new page component.
    { view: View.Wellness, icon: <SparklesIcon /> },
    { view: View.Music, icon: <MusicIcon /> },
    { view: View.CommunityHub, icon: <UsersIcon /> },
    { view: View.Chats, icon: <ChatBubbleLeftRightIcon /> },
    { view: View.Education, icon: <BookOpenIcon /> },
    { view: View.SymptomChecker, icon: <CpuIcon /> },
  ];

  return (
    <div className="w-24 lg:w-64 bg-white shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center lg:justify-start p-4 lg:p-6 border-b">
          <LifeBuoyIcon />
          <h1 className="hidden lg:block text-2xl font-bold text-teal-600 ml-3">ElderlyEase</h1>
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
          onClick={onSosClick}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center text-xl transition-transform transform hover:scale-105"
        >
          <span className="hidden lg:inline-block mr-3">SOS</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </button>
        <button
          onClick={() => setActiveView(View.Profile)}
          className="w-full flex items-center mt-6 p-2 rounded-lg bg-gray-100 hover:bg-teal-100 transition-colors text-left"
        >
            <img src={userDetails.profilePicUrl} alt={userDetails.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="hidden lg:block ml-3">
                <p className="font-semibold text-gray-800">{userDetails.name}</p>
                <p className="text-sm text-gray-500">View Profile</p>
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

export default Sidebar;
