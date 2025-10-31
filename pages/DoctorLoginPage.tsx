import React from 'react';
import { DOCTORS } from '../constants';
import { Doctor } from '../types';
import { LifeBuoyIcon } from '../components/icons/Icons';

interface DoctorLoginPageProps {
  onLogin: (doctor: Doctor) => void;
}

const DoctorLoginPage: React.FC<DoctorLoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-8">
            <LifeBuoyIcon />
            <h1 className="text-4xl font-bold text-teal-600 ml-4">Doctor Portal</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back, Doctor</h2>
        <p className="text-xl text-gray-500 mb-10">Please select your profile to continue.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {DOCTORS.map(doctor => (
                <button 
                    key={doctor.id}
                    onClick={() => onLogin(doctor)}
                    className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center transition-transform transform hover:-translate-y-2 hover:shadow-xl group"
                >
                    <img src={doctor.imageUrl} alt={doctor.name} className="w-28 h-28 rounded-full mb-4 border-4 border-gray-200 group-hover:border-teal-400 transition-colors" />
                    <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                    <p className="text-md text-teal-600 font-semibold">{doctor.specialty}</p>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorLoginPage;
