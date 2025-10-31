import React from 'react';

const MusicPage: React.FC = () => {
    // The user's link is https://www.youtube.com/watch?v=eTucXMU8ctw&list=RDeTucXMU8ctw&index=1
    // We construct the embeddable playlist URL from this link.
    const playlistUrl = "https://www.youtube.com/embed/eTucXMU8ctw?list=RDeTucXMU8ctw";

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Relaxing Music</h2>
                <p className="text-2xl text-gray-500 mt-2">A space to unwind and listen to calming tunes.</p>
            </header>

            <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                        className="w-full h-full rounded-xl"
                        style={{ height: '70vh' }}
                        src={playlistUrl}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default MusicPage;