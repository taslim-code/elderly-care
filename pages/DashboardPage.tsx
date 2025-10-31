

import React from 'react';
import { View } from '../types';
import { StethoscopeIcon, ClipboardIcon, BellIcon, SparklesIcon, CpuIcon, MusicalNoteIcon } from '../components/icons/Icons';
import DashboardCard from '../components/DashboardCard';

interface DashboardPageProps {
    setActiveView: (view: View) => void;
    userName: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveView, userName }) => {
    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Welcome back, {userName}!</h2>
                <p className="text-2xl text-gray-500 mt-2">Here's your health summary for today.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard 
                    title="Next Appointment" 
                    icon={<StethoscopeIcon />}
                    onClick={() => setActiveView(View.Consultation)}
                    className="bg-teal-50"
                >
                    <p className="text-lg text-gray-700">Dr. Marcus Chen (Geriatrician)</p>
                    <p className="text-2xl font-bold text-teal-700 mt-2">Tomorrow, 11:00 AM</p>
                    <button className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">View Details</button>
                </DashboardCard>

                <DashboardCard 
                    title="Medication Reminder" 
                    icon={<BellIcon />}
                    onClick={() => setActiveView(View.Reminders)}
                >
                    <p className="text-lg text-gray-700">Next dose:</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">Metformin (500mg) at 8:00 AM</p>
                    <p className="text-md text-gray-500 mt-1">You have 3 other medications today.</p>
                </DashboardCard>

                <DashboardCard 
                    title="How are you feeling?" 
                    icon={<SparklesIcon />}
                    // FIX: Changed View.Journal to View.Wellness to navigate to the correct page.
                    onClick={() => setActiveView(View.Wellness)}
                >
                    <p className="text-lg text-gray-700 mb-4">Log your mood in your journal.</p>
                    <div className="flex justify-around">
                        <button className="text-5xl hover:scale-110 transition-transform">😊</button>
                        <button className="text-5xl hover:scale-110 transition-transform">😐</button>
                        <button className="text-5xl hover:scale-110 transition-transform">😔</button>
                    </div>
                </DashboardCard>

                <DashboardCard 
                    title="AI Symptom Checker" 
                    icon={<CpuIcon />}
                    onClick={() => setActiveView(View.SymptomChecker)}
                    className="md:col-span-2 lg:col-span-1"
                >
                    <p className="text-lg text-gray-700">Feeling unwell? Describe your symptoms to get instant, AI-powered health information.</p>
                    <p className="text-sm text-gray-500 mt-2">Note: This is not a substitute for professional medical advice.</p>
                </DashboardCard>
                
                <DashboardCard 
                    title="Health Records" 
                    icon={<ClipboardIcon />}
                    onClick={() => setActiveView(View.HealthRecords)}
                    className="lg:col-span-1"
                >
                    <p className="text-lg text-gray-700 mb-3">Quickly access your medical history, prescriptions, and lab reports.</p>
                    <div className="flex space-x-4">
                        <button className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300">View</button>
                    </div>
                </DashboardCard>
                
                <DashboardCard
                    title="Relaxing Music"
                    icon={<MusicalNoteIcon />}
                    onClick={() => window.open('https://www.youtube.com/watch?v=eTucXMU8ctw&list=RDeTucXMU8ctw&index=1', '_blank')}
                    className="lg:col-span-1"
                >
                    <p className="text-lg text-gray-700">Unwind and relax with a curated playlist of calming songs.</p>
                </DashboardCard>
            </div>
        </div>
    );
};

export default DashboardPage;
