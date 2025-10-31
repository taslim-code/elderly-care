import React, { useState, useEffect, useRef } from 'react';
import type { Doctor } from '../types';
import { MicrophoneIcon, MicrophoneSlashIcon, VideoCameraIcon, VideoCameraSlashIcon, PhoneHangUpIcon } from './icons/Icons';

interface VideoCallModalProps {
  doctor: Doctor;
  onEndCall: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ doctor, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<'connecting' | 'connected'>('connecting');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        localStreamRef.current = stream;
      } catch (err) {
        console.error("Error accessing media devices.", err);
        // Handle error (e.g., show a message to the user)
        onEndCall(); // Close modal if permissions are denied
      }
    };

    startMedia();
    
    const connectionTimer = setTimeout(() => setStatus('connected'), 3000);
    const durationTimer = setInterval(() => setCallDuration(prev => prev + 1), 1000);

    return () => {
      // Cleanup: stop media stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      clearTimeout(connectionTimer);
      clearInterval(durationTimer);
    };
  }, [onEndCall]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-fade-in">
      {/* Remote video (placeholder) */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative bg-black">
        <img src={doctor.imageUrl} alt={doctor.name} className="w-48 h-48 rounded-full border-4 border-gray-600 opacity-50" />
        <div className="absolute top-6 left-6 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            <h2 className="text-2xl font-bold">{doctor.name}</h2>
            <p className="text-lg">{doctor.specialty}</p>
            <p className="text-lg font-mono tracking-wider mt-2">{formatDuration(callDuration)}</p>
        </div>
        {status === 'connecting' && (
            <p className="absolute bottom-1/2 translate-y-32 text-2xl text-white">Connecting...</p>
        )}
      </div>

      {/* Local video preview */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className={`absolute bottom-28 right-6 w-48 h-36 rounded-lg object-cover shadow-2xl border-2 border-gray-500 transition-opacity duration-300 ${isCameraOff ? 'opacity-0' : 'opacity-100'}`}
        style={{ transform: 'scaleX(-1)' }}
      ></video>
      {isCameraOff && (
        <div className="absolute bottom-28 right-6 w-48 h-36 rounded-lg bg-gray-800 flex items-center justify-center border-2 border-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
      )}


      {/* Call controls */}
      <div className="bg-gray-800 bg-opacity-70 py-4 flex justify-center items-center space-x-6">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-gray-800' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicrophoneSlashIcon /> : <MicrophoneIcon />}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-white text-gray-800' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
          aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        >
          {isCameraOff ? <VideoCameraSlashIcon /> : <VideoCameraIcon />}
        </button>
        <button
          onClick={onEndCall}
          className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          aria-label="End call"
        >
          <PhoneHangUpIcon />
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VideoCallModal;
