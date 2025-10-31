import React, { useState } from 'react';
import { UserDetails } from '../types';
import { UserIcon, EnvelopeIcon, DevicePhoneMobileIcon, CalendarIcon, CameraIcon } from '../components/icons/Icons';
import UpdateProfilePicModal from '../components/UpdateProfilePicModal';


interface ProfilePageProps {
  user: UserDetails;
  onUpdateProfilePic: (newPicUrl: string) => void;
}

const ProfileInfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center border-b py-4">
        <div className="text-gray-500 mr-4">{icon}</div>
        <div className="flex-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);


const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfilePic }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProfilePic = (newPicUrl: string) => {
    onUpdateProfilePic(newPicUrl);
    setIsModalOpen(false);
  };

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-5xl font-bold text-gray-800">Your Profile</h2>
        <p className="text-2xl text-gray-500 mt-2">Manage your personal information and preferences.</p>
      </header>

      <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                      <img 
                          src={user.profilePicUrl}
                          alt="Profile" 
                          className="w-32 h-32 rounded-full border-4 border-teal-500 object-cover" 
                      />
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
                        aria-label="Change profile picture"
                      >
                          <CameraIcon className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mt-4">{user.name}</h3>
              </div>

              <div className="space-y-2">
                <ProfileInfoRow icon={<UserIcon className="h-6 w-6" />} label="Full Name" value={user.name} />
                <ProfileInfoRow icon={<EnvelopeIcon className="h-6 w-6" />} label="Email Address" value={user.email} />
                <ProfileInfoRow icon={<DevicePhoneMobileIcon className="h-6 w-6" />} label="Phone Number" value={user.phone} />
                <ProfileInfoRow icon={<CalendarIcon />} label="Age" value={user.age} /> 
              </div>

              <div className="mt-8">
                  <button className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-teal-700 transition-colors">
                      Save Changes
                  </button>
              </div>
          </div>
      </div>

      <UpdateProfilePicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfilePic}
      />
    </div>
  );
};

export default ProfilePage;