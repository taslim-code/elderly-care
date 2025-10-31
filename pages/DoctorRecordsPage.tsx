import React, { useState, useMemo } from 'react';
import { HealthRecord, UserDetails, Doctor, Reminder, ChatConversation } from '../types';
import { ClipboardIcon, DownloadIcon, PaperClipIcon, UploadIcon, EnvelopeIcon, PhoneIcon, ChatBubbleIcon, DocumentTextIcon } from '../components/icons/Icons';
import UploadRecordModal from '../components/UploadRecordModal';
import RecordViewerModal from '../components/RecordViewerModal';

interface DoctorRecordsPageProps {
  healthRecords: HealthRecord[];
  patients: UserDetails[];
  reminders: Reminder[];
  conversations: ChatConversation[];
  doctor: Doctor;
  onAddHealthRecord: (newRecordData: Omit<HealthRecord, 'id' | 'uploadedAt'>) => void;
}

const getIconForType = (type: HealthRecord['type']) => {
    switch(type) {
        case 'Prescription': return <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><PaperClipIcon className="h-5 w-5"/></div>;
        case 'Lab Report': return <div className="bg-green-100 text-green-600 p-3 rounded-full"><ClipboardIcon className="h-5 w-5"/></div>;
        case 'Consultation Note': return <div className="bg-purple-100 text-purple-600 p-3 rounded-full"><DocumentTextIcon className="h-5 w-5"/></div>;
        default: return <div className="bg-gray-100 text-gray-600 p-3 rounded-full"><ClipboardIcon className="h-5 w-5"/></div>;
    }
};

const DoctorRecordsPage: React.FC<DoctorRecordsPageProps> = ({ healthRecords, patients, reminders, conversations, onAddHealthRecord }) => {
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients.length > 0 ? patients[0].id : null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);
    const [filter, setFilter] = useState<'All' | HealthRecord['type']>('All');

    const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId), [patients, selectedPatientId]);
    
    const patientAppointments = useMemo(() => {
        if (!selectedPatientId) return [];
        return reminders.filter(r => r.patientId === selectedPatientId && r.type === 'Appointment');
    }, [reminders, selectedPatientId]);

    const patientConversation = useMemo(() => {
        if (!selectedPatientId) return null;
        return conversations.find(c => c.patientId === selectedPatientId);
    }, [conversations, selectedPatientId]);

    const patientHealthRecords = useMemo(() => {
        if (!selectedPatientId) return [];
        
        const records = healthRecords.filter(record => record.patientId === selectedPatientId);
        
        const filteredRecords = filter === 'All'
            ? records
            : records.filter(record => record.type === filter);
            
        return filteredRecords.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    }, [healthRecords, selectedPatientId, filter]);

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
        <div className="flex h-full max-h-[calc(100vh-64px)] gap-8">
            {/* Left Panel: Patient List */}
            <div className="w-1/3 min-w-[350px] bg-white rounded-2xl shadow-lg flex flex-col">
                 <div className="p-6 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Patients</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {patients.map(patient => (
                        <button 
                            key={patient.id}
                            onClick={() => setSelectedPatientId(patient.id)}
                            className={`w-full text-left p-4 flex items-center space-x-4 border-b hover:bg-gray-50 ${selectedPatientId === patient.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''}`}
                        >
                            <img src={patient.profilePicUrl} alt={patient.name} className="w-14 h-14 rounded-full object-cover" />
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-lg text-gray-800 truncate">{patient.name}</p>
                                <p className="text-md text-gray-600">Age: {patient.age}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Patient Dossier */}
            <div className="w-2/3 flex-1 flex flex-col bg-gray-50 rounded-2xl shadow-inner overflow-y-auto">
                {selectedPatient ? (
                    <div className="p-8 space-y-8">
                        {/* Patient Header */}
                        <div className="flex items-start">
                            <img src={selectedPatient.profilePicUrl} alt={selectedPatient.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
                            <div className="ml-6 flex-1">
                                <h3 className="text-4xl font-bold text-gray-800">{selectedPatient.name}</h3>
                                <div className="flex items-center space-x-6 text-gray-600 mt-2 text-lg">
                                    <div className="flex items-center"><EnvelopeIcon className="h-5 w-5 mr-2" /> <span>{selectedPatient.email}</span></div>
                                    <div className="flex items-center"><PhoneIcon className="h-5 w-5 mr-2" /> <span>{selectedPatient.phone}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl shadow">
                                <h4 className="font-semibold text-gray-500">Upcoming Appointments</h4>
                                <p className="text-2xl font-bold text-teal-700">{patientAppointments.length}</p>
                                {patientAppointments[0] && <p className="text-sm text-gray-500 truncate">Next: {patientAppointments[0].time}</p>}
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow">
                                <h4 className="font-semibold text-gray-500">Last Communication</h4>
                                {patientConversation ? (
                                    <>
                                        <p className="text-xl font-bold text-gray-700 truncate">{patientConversation.lastMessage}</p>
                                        <p className="text-sm text-gray-500">{patientConversation.lastMessageTimestamp}</p>
                                    </>
                                ) : <p className="text-xl font-bold text-gray-700">None</p>}
                            </div>
                        </div>
                        
                        {/* Health Record Timeline */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-2xl font-bold text-gray-800">Health Record Timeline</h4>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="flex items-center bg-teal-600 text-white font-bold py-2 px-4 rounded-lg text-md hover:bg-teal-700 transition-colors"
                                >
                                    <UploadIcon className="h-5 w-5 mr-2" />
                                    Add Record
                                </button>
                            </div>
                            <div className="mb-4 flex space-x-2 bg-white p-1 rounded-lg shadow-sm max-w-md">
                                {(['All', 'Prescription', 'Lab Report', 'Consultation Note'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`w-full text-center font-semibold py-1 px-3 text-sm rounded-md transition-colors ${filter === type ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                             <div className="space-y-4">
                                {patientHealthRecords.length > 0 ? patientHealthRecords.map(record => (
                                    <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                                        <div className="flex items-center">
                                            {getIconForType(record.type)}
                                            <div className="ml-4">
                                                <p className="text-lg font-bold text-gray-800">{record.title}</p>
                                                <div className="flex items-center text-sm text-gray-600 mt-1 space-x-3">
                                                    <span>{record.type}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{new Date(record.eventDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {record.fileName && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setViewingRecord(record)}
                                                    className="flex items-center bg-teal-100 text-teal-800 font-semibold py-2 px-3 rounded-lg hover:bg-teal-200 text-sm"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(record)}
                                                    className="flex items-center bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 text-sm"
                                                >
                                                    <DownloadIcon className="h-4 w-4 mr-2"/>
                                                    Download
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                                        <p className="text-lg font-semibold text-gray-500">No {filter !== 'All' ? filter.toLowerCase() : ''} records found for {selectedPatient.name}.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <h3 className="mt-4 text-2xl font-semibold">Select a patient</h3>
                        <p className="mt-1 text-lg">Choose a patient from the list to view their complete health dossier.</p>
                    </div>
                )}
            </div>

            {selectedPatient && (
                <UploadRecordModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUpload={onAddHealthRecord}
                    patientId={selectedPatient.id}
                />
            )}
             <RecordViewerModal 
                isOpen={!!viewingRecord}
                onClose={() => setViewingRecord(null)}
                record={viewingRecord}
            />
        </div>
    );
};

export default DoctorRecordsPage;
