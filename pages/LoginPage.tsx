import React, { useState } from 'react';
import { LifeBuoyIcon, UserIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '../components/icons/Icons';
import AgePage from './AgePage';
import { UserDetails } from '../types';

interface LoginPageProps {
  onLogin: (details: Omit<UserDetails, 'profilePicUrl' | 'id'>) => void;
}

interface UserDetailsForm {
  name: string;
  email: string;
  phone: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [userDetails, setUserDetails] = useState<UserDetailsForm>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<UserDetailsForm>>({});

  const validate = (): boolean => {
    const newErrors: Partial<UserDetailsForm> = {};
    if (!userDetails.name.trim()) newErrors.name = 'Full name is required.';
    if (!userDetails.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!userDetails.phone.match(/^\d{10}$/)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep(2);
    }
  };

  const handleRegistrationComplete = (age: number) => {
    const finalDetails = { ...userDetails, age };
    console.log('Registration complete:', finalDetails);
    onLogin(finalDetails);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserDetails(prev => ({ ...prev, [name]: value }));
      if (errors[name as keyof UserDetailsForm]) {
          setErrors(prev => ({...prev, [name]: undefined }));
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <LifeBuoyIcon />
          <h1 className="text-4xl font-bold text-teal-600 ml-4">ElderlyEase</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500" style={{ minHeight: '450px' }}>
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Create Your Account</h2>
              <p className="text-center text-gray-500 mb-8">Join our community to take better care of yourself.</p>
              
              <form onSubmit={handleNext} className="space-y-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <UserIcon className="h-6 w-6" />
                    </span>
                    <input 
                        type="text" 
                        name="name"
                        value={userDetails.name}
                        onChange={handleChange}
                        placeholder="Full Name" 
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-400'}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <EnvelopeIcon className="h-6 w-6" />
                    </span>
                    <input 
                        type="email" 
                        name="email"
                        value={userDetails.email}
                        onChange={handleChange}
                        placeholder="Email Address" 
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 transition ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-400'}`}
                    />
                     {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                 <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <DevicePhoneMobileIcon className="h-6 w-6" />
                    </span>
                    <input 
                        type="tel" 
                        name="phone"
                        value={userDetails.phone}
                        onChange={handleChange}
                        placeholder="Phone Number" 
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 transition ${errors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-400'}`}
                    />
                     {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-teal-700 transition-transform transform hover:scale-105">
                  Continue &rarr;
                </button>
              </form>
            </div>
          )}
          {step === 2 && (
             <AgePage 
                userName={userDetails.name} 
                onComplete={handleRegistrationComplete}
                onBack={() => setStep(1)}
            />
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;