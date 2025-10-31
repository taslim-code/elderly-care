import React, { useState } from 'react';
import { DOCTORS } from '../constants';
import type { Doctor } from '../types';
import VideoCallModal from '../components/VideoCallModal';

const DoctorCard: React.FC<{ doctor: Doctor, onStartCall: (doctor: Doctor) => void }> = ({ doctor, onStartCall }) => {
    
    const handleRequestVisit = () => {
        const subject = encodeURIComponent("Home Visit Request");
        const body = encodeURIComponent(
`Dear ${doctor.name},

I would like to request a home visit.

Please contact me to schedule a convenient time.

Thank you,
John Doe`
        );
        window.location.href = `mailto:${doctor.email}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center transition-transform transform hover:-translate-y-2">
            <img src={doctor.imageUrl} alt={doctor.name} className="w-28 h-28 rounded-full mb-4 border-4 border-gray-200" />
            <h3 className="text-2xl font-bold text-gray-800">{doctor.name}</h3>
            <p className="text-lg text-teal-600 font-semibold">{doctor.specialty}</p>
            <div className={`mt-4 px-4 py-1 rounded-full text-sm font-semibold ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {doctor.available ? 'Available Now' : 'Unavailable'}
            </div>
            <div className="mt-6 w-full space-y-3">
                <button 
                    disabled={!doctor.available}
                    onClick={() => onStartCall(doctor)}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Start Video Call
                </button>
                 <button 
                    onClick={() => window.location.href = `tel:${doctor.phone}`}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Start Phone Call
                </button>
                <button 
                    onClick={handleRequestVisit}
                    className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Request Home Visit
                </button>
            </div>
        </div>
    );
};

const ConsultationPage: React.FC = () => {
    const [callDetails, setCallDetails] = useState<{ doctor: Doctor } | null>(null);

    const handleStartCall = (doctor: Doctor) => {
        setCallDetails({ doctor });
    };

    const handleEndCall = () => {
        setCallDetails(null);
    };

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Doctor Consultation</h2>
                <p className="text-2xl text-gray-500 mt-2">Connect with professional healthcare providers from home.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {DOCTORS.map(doctor => <DoctorCard key={doctor.name} doctor={doctor} onStartCall={handleStartCall} />)}
            </div>

            {callDetails && (
                <VideoCallModal 
                    doctor={callDetails.doctor} 
                    onEndCall={handleEndCall} 
                />
            )}
        </div>
    );
};

export default ConsultationPage;