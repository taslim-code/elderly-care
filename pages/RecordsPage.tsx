import React, { useState } from 'react';
import type { HealthRecord } from '../types';
import { ClipboardIcon, UploadIcon, DownloadIcon, PaperClipIcon, DocumentTextIcon } from '../components/icons/Icons';
import UploadRecordModal from '../components/UploadRecordModal';
import RecordViewerModal from '../components/RecordViewerModal';

interface RecordsPageProps {
  healthRecords: HealthRecord[];
  onAddRecord: (newRecordData: Omit<HealthRecord, 'id' | 'uploadedAt'>) => void;
  patientId: string;
}

const getIconForType = (type: HealthRecord['type']) => {
    switch(type) {
        case 'Prescription': return <div className="bg-blue-100 text-blue-600 p-4 rounded-full"><PaperClipIcon /></div>;
        case 'Lab Report': return <div className="bg-green-100 text-green-600 p-4 rounded-full"><ClipboardIcon /></div>;
        case 'Consultation Note': return <div className="bg-purple-100 text-purple-600 p-4 rounded-full"><DocumentTextIcon /></div>;
        default: return <div className="bg-gray-100 text-gray-600 p-4 rounded-full"><ClipboardIcon /></div>;
    }
};

const RecordsPage: React.FC<RecordsPageProps> = ({ healthRecords, onAddRecord, patientId }) => {
    const [filter, setFilter] = useState<'All' | HealthRecord['type']>('All');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);

    const filteredRecords = filter === 'All'
        ? healthRecords
        : healthRecords.filter(record => record.type === filter);
        
    const sortedRecords = filteredRecords.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

    const handleDownload = (record: HealthRecord) => {
        if (!record.fileData || !record.fileName) return;

        const getMimeType = (fileName: string): string => {
            const extension = fileName.split('.').pop()?.toLowerCase();
            switch (extension) {
                case 'pdf': return 'application/pdf';
                case 'jpg':
                case 'jpeg': return 'image/jpeg';
                case 'png': return 'image/png';
                case 'doc': return 'application/msword';
                case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                default: return 'application/octet-stream';
            }
        };

        try {
            const byteCharacters = atob(record.fileData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: getMimeType(record.fileName) });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = record.fileName;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download file:", error);
            alert("Could not download the file. It might be corrupted.");
        }
    };

    return (
        <div>
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h2 className="text-5xl font-bold text-gray-800">Health Records</h2>
                    <p className="text-2xl text-gray-500 mt-2">Your complete medical history in one place.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-teal-700 transition-colors"
                >
                    <UploadIcon className="h-6 w-6 mr-2" />
                    Upload New Record
                </button>
            </header>

            <div className="mb-8 flex space-x-2 bg-gray-200 p-2 rounded-xl max-w-lg">
                {(['All', 'Prescription', 'Lab Report', 'Consultation Note'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors ${filter === type ? 'bg-white text-teal-700 shadow' : 'text-gray-600 hover:bg-white/50'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {sortedRecords.length > 0 ? sortedRecords.map(record => (
                    <div key={record.id} className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all hover:shadow-xl">
                        <div className="flex items-center">
                            {getIconForType(record.type)}
                            <div className="ml-6">
                                <p className="text-2xl font-bold text-gray-800">{record.title}</p>
                                <div className="flex items-center text-lg text-gray-600 mt-1 space-x-4">
                                    <span>{record.type}</span>
                                    <span className="text-gray-400">|</span>
                                    <span>{new Date(record.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                        {record.fileName && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewingRecord(record)}
                                    className="flex items-center bg-teal-100 text-teal-800 font-semibold py-3 px-5 rounded-lg hover:bg-teal-200"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleDownload(record)}
                                    className="flex items-center bg-gray-200 text-gray-800 font-semibold py-3 px-5 rounded-lg hover:bg-gray-300"
                                >
                                    <DownloadIcon className="h-5 w-5 mr-2"/>
                                    Download
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                     <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <p className="text-2xl font-semibold text-gray-500">No records found for this category.</p>
                        <p className="text-lg text-gray-400 mt-2">Try selecting another category or uploading a new record.</p>
                    </div>
                )}
            </div>
            
            <UploadRecordModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={onAddRecord}
                patientId={patientId}
            />
             <RecordViewerModal 
                isOpen={!!viewingRecord}
                onClose={() => setViewingRecord(null)}
                record={viewingRecord}
            />
        </div>
    );
};

export default RecordsPage;
