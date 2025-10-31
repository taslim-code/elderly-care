import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HealthRecord } from '../types';
import { UploadIcon, CameraIcon } from './icons/Icons';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newRecordData: Omit<HealthRecord, 'id' | 'uploadedAt'>) => void;
  patientId: string;
}

type UploadMode = 'upload' | 'capture';
type CaptureState = 'camera' | 'preview';

const UploadRecordModal: React.FC<UploadRecordModalProps> = ({ isOpen, onClose, onUpload, patientId }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HealthRecord['type']>('Consultation Note');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  
  // File/Capture state
  const [file, setFile] = useState<File | null>(null);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  
  // UI state
  const [uploadMode, setUploadMode] = useState<UploadMode>('upload');
  const [captureState, setCaptureState] = useState<CaptureState>('camera');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCaptureState('camera');
    setCapturedImageData(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Could not access camera. Please check permissions.");
      }
    } else {
      setError("Camera not supported on this device.");
    }
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setType('Consultation Note');
    setEventDate(new Date().toISOString().split('T')[0]);
    setFile(null);
    setCapturedImageData(null);
    setError('');
    setIsDragging(false);
    setUploadMode('upload');
    setCaptureState('camera');
    stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (isOpen) {
      if (uploadMode === 'capture') {
        startCamera();
      }
    } else {
      resetForm();
    }
    return () => stopCamera();
  }, [isOpen, uploadMode, startCamera, stopCamera, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setCapturedImageData(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImageData(dataUrl);
        setFile(null);
        setCaptureState('preview');
        stopCamera();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!file && !capturedImageData) {
        setError('Please upload a file or capture a photo.');
        return;
    }
    setError('');

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        const newRecord: Omit<HealthRecord, 'id' | 'uploadedAt'> = { title, type, eventDate, patientId, fileName: file.name, fileData: base64String };
        onUpload(newRecord);
        handleClose();
      };
      reader.readAsDataURL(file);
    } else if (capturedImageData) {
      const newRecord: Omit<HealthRecord, 'id' | 'uploadedAt'> = {
        title, type, eventDate, patientId,
        fileName: `capture-${Date.now()}.jpg`,
        fileData: capturedImageData.split(',')[1],
      };
      onUpload(newRecord);
      handleClose();
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-4 p-8 transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Health Record</h2>
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-4 flex-grow">
          {/* Form Fields */}
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">Record Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Annual Check-up Summary" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="type" className="block text-lg font-medium text-gray-700">Record Type</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as HealthRecord['type'])} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                <option>Consultation Note</option>
                <option>Lab Report</option>
                <option>Prescription</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="eventDate" className="block text-lg font-medium text-gray-700">Date of Event</label>
              <input type="date" id="eventDate" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button type="button" onClick={() => setUploadMode('upload')} className={`${uploadMode === 'upload' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg`}>Upload File</button>
                <button type="button" onClick={() => setUploadMode('capture')} className={`${uploadMode === 'capture' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg`}>Capture Photo</button>
            </nav>
          </div>

          {/* Upload/Capture Area */}
          {uploadMode === 'upload' && (
            <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 text-lg text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 hover:text-teal-500">
                  <span>{file ? 'Change file' : 'Upload a file'}</span>
                  <input id="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
              {file && <p className="mt-2 text-md font-semibold text-green-700">Selected: {file.name}</p>}
            </div>
          )}
          
          {uploadMode === 'capture' && (
            <div>
              {captureState === 'camera' && (
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                </div>
              )}
              {captureState === 'preview' && capturedImageData && (
                  <img src={capturedImageData} alt="Captured record" className="rounded-lg aspect-video object-cover" />
              )}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <div className="mt-4 flex space-x-4">
                {captureState === 'preview' ? (
                  <button type="button" onClick={startCamera} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300">Retake Photo</button>
                ) : (
                  <button type="button" onClick={capturePhoto} className={`flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors`}>
                      <CameraIcon className="h-6 w-6 mr-2" /> Capture
                  </button>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-6 mt-auto border-t">
          <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
          <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700">Upload Record</button>
        </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UploadRecordModal;
