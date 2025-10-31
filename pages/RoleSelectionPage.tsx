import React from 'react';
import { LifeBuoyIcon, StethoscopeIcon, UserIcon } from '../components/icons/Icons';

interface RoleSelectionPageProps {
  onSelectRole: (role: 'patient' | 'doctor') => void;
}

// FIX: Changed icon prop type from React.ReactNode to a more specific React.ReactElement that accepts a className, resolving a type error with React.cloneElement.
const RoleCard: React.FC<{ title: string; description: string; icon: React.ReactElement<{ className?: string }>; onClick: () => void }> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center border border-white/20"
  >
    <div className="bg-teal-100 p-5 rounded-full text-teal-600 mb-6">
      {/* FIX: Removed unnecessary type assertion for the icon prop, as its type is now more specific. */}
      {React.cloneElement(icon, { className: "h-16 w-16" })}
    </div>
    <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    <p className="text-lg text-gray-600 mt-2">{description}</p>
  </button>
);

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
  const imageUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop";
  
  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 font-sans bg-cover bg-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center">
            <LifeBuoyIcon />
            <h1 className="text-5xl font-bold text-white ml-4 drop-shadow-lg">ElderlyEase</h1>
          </div>
          <p className="text-2xl text-gray-200 mt-4 drop-shadow-md">Your trusted partner in senior healthcare.</p>
        </div>

        <h2 className="text-3xl font-bold text-white text-center mb-8 drop-shadow-md">Who are you?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RoleCard
            title="I'm a Patient"
            description="Access your health records, reminders, and connect with your care team."
            icon={<UserIcon />}
            onClick={() => onSelectRole('patient')}
          />
          <RoleCard
            title="I'm a Doctor"
            description="Manage your patients, view appointments, and provide consultations."
            icon={<StethoscopeIcon />}
            onClick={() => onSelectRole('doctor')}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
