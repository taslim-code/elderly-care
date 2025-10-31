import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon, CameraIcon } from './icons/Icons';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachMedia: (url: string, type: 'image' | 'video') => void;
  mode: 'image' | 'video';
}

type UploadMode = 'upload' | 'capture';
type CaptureState = 'camera' | 'preview';

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ isOpen, onClose, onAttachMedia, mode }) => {
  const [uploadMode, setUploadMode] = useState<UploadMode>('upload');
  const [captureState, setCaptureState] = useState<CaptureState>('camera');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
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
    setMediaPreviewUrl(null);
    setError('');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
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

  const resetState = useCallback(() => {
    setMediaPreviewUrl(null);
    setError('');
    setIsDragging(false);
    setUploadMode('upload');
    setCaptureState('camera');
    stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (isOpen) {
      resetState();
    } else {
      stopCamera();
    }
  }, [isOpen, resetState, stopCamera]);
  
  useEffect(() => {
    if(isOpen && uploadMode === 'capture') {
        startCamera();
    } else {
        stopCamera();
    }
  }, [isOpen, uploadMode, startCamera, stopCamera]);

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const fileType = file.type.split('/')[0];
    if (fileType !== mode) {
        setError(`Please select an ${mode} file.`);
        return;
    }
    setError('');
    const url = URL.createObjectURL(file);
    setMediaPreviewUrl(url);
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
        setMediaPreviewUrl(dataUrl);
        setCaptureState('preview');
        stopCamera();
      }
    }
  };
  
  const handleCapture = () => {
      // Note: Video recording is complex and uses MediaRecorder API.
      // For this implementation, capture is only supported for photos.
      if (mode === 'image') {
          capturePhoto();
      } else {
          alert("Live video recording is not supported. Please upload a video file instead.");
      }
  }


  const handleAttach = () => {
    if (!mediaPreviewUrl) {
        setError('Please select or capture media first.');
        return;
    }
    onAttachMedia(mediaPreviewUrl, mode);
    handleClose();
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

  const renderUploadContent = () => (
    <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`flex justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
        <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-lg text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 hover:text-teal-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" accept={`${mode}/*`} className="sr-only" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                </label>
                <p className="pl-1">or drag and drop</p>
            </div>
             <p className="text-sm text-gray-500">Supports {mode === 'image' ? 'PNG, JPG, GIF' : 'MP4, MOV'}</p>
        </div>
    </div>
  );

  const renderCaptureContent = () => (
    <div>
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }}></video>
        </div>
        <button type="button" onClick={handleCapture} disabled={mode==='video'} className="mt-4 w-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <CameraIcon className="h-6 w-6 mr-2" /> Capture Photo
        </button>
    </div>
  );

  const renderPreviewContent = () => (
     <div className="text-center">
        {mode === 'image' ? (
            <img src={mediaPreviewUrl!} alt="Preview" className="max-h-80 w-auto rounded-lg mx-auto mb-4 object-contain" />
        ) : (
            <video src={mediaPreviewUrl!} controls className="max-h-80 w-auto rounded-lg mx-auto mb-4"></video>
        )}
        <button type="button" onClick={() => uploadMode === 'upload' ? setMediaPreviewUrl(null) : startCamera()} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
            {uploadMode === 'upload' ? 'Choose Another' : 'Retake'}
        </button>
    </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full m-4 p-8 transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add {mode === 'image' ? 'Photo' : 'Video'}</h2>
        
        <div className="border-b border-gray-200 mb-5">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button type="button" onClick={() => { setUploadMode('upload'); setMediaPreviewUrl(null); }} className={`${uploadMode === 'upload' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Upload</button>
                <button type="button" onClick={() => { setUploadMode('capture'); setMediaPreviewUrl(null); }} className={`${uploadMode === 'capture' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Capture</button>
            </nav>
        </div>

        <div className="flex-grow min-h-[250px] flex items-center justify-center">
            {mediaPreviewUrl ? renderPreviewContent() : (uploadMode === 'upload' ? renderUploadContent() : renderCaptureContent())}
        </div>
        
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-6 mt-4 border-t">
          <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
          <button type="button" onClick={handleAttach} disabled={!mediaPreviewUrl} className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Attach</button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
export default MediaUploadModal;
