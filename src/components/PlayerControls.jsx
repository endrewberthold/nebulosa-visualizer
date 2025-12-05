import React from 'react'

const PlayerControls = ({ currentTrack, isPaused, player }) => {
    if (!currentTrack) {
        return (
            <div className="text-neutral-400 animate-pulse">
                Waiting for music... Open Spotify on your phone/PC and select "React Visualizer Player"
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-4 bg-neutral-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-neutral-700">
            <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.name}
                className="w-48 h-48 rounded-lg shadow-lg"
            />

            <div className="text-center">
                <h3 className="text-xl font-bold text-white truncate w-64">
                    {currentTrack.name}
                </h3>
                <p className="text-neutral-400 text-sm">
                    {currentTrack.artists.map((artist) => artist.name).join(', ')}
                </p>
            </div>

            <div className="flex gap-4 mt-2">
                <button
                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform cursor-pointer"
                    onClick={() => player.previousTrack()}
                >
                    Prev
                </button>

                <button
                    className="p-3 bg-green-500 text-black rounded-full hover:scale-110 transition-transform font-bold w-24 cursor-pointer"
                    onClick={() => player.togglePlay()}
                >
                    {isPaused ? 'PLAY' : 'PAUSE'}
                </button>

                <button
                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform cursor-pointer"
                    onClick={() => player.nextTrack()}
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default PlayerControls