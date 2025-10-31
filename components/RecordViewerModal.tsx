import React from 'react';
import type { HealthRecord } from '../types';

interface RecordViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord | null;
}

const RecordViewerModal: React.FC<RecordViewerModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record || !record.fileData || !record.fileName) return null;

  const getMimeType = (fileName: string): string => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
          case 'pdf': return 'application/pdf';
          case 'jpg':
          case 'jpeg': return 'image/jpeg';
          case 'png': return 'image/png';
          case 'gif': return 'image/gif';
          case 'webp': return 'image/webp';
          default: return 'unsupported';
      }
  };

  const mimeType = getMimeType(record.fileName);
  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';

  const dataUrl = `data:${mimeType};base64,${record.fileData}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full m-4 transform transition-all animate-fade-in-up flex flex-col"
        style={{ height: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b">
            <h3 className="text-2xl font-bold text-gray-800">{record.title}</h3>
            <button
                onClick={onClose}
                className="bg-gray-100 rounded-full p-2 text-gray-800 hover:bg-gray-200"
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="flex-1 p-4 overflow-auto bg-gray-50">
            {isImage && (
                <img src={dataUrl} alt={record.title} className="max-w-full max-h-full mx-auto" />
            )}
            {isPdf && (
                <embed src={dataUrl} type="application/pdf" className="w-full h-full" />
            )}
            {!isImage && !isPdf && (
                <div className="text-center p-10 flex flex-col items-center justify-center h-full">
                    <p className="text-2xl font-semibold text-gray-600">Preview not available</p>
                    <p className="text-lg text-gray-500 mt-2">This file type ({record.fileName.split('.').pop()}) cannot be displayed in the browser.</p>
                    <p className="text-lg text-gray-500 mt-1">Please download the file to view it.</p>
                </div>
            )}
        </div>
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

export default RecordViewerModal;
