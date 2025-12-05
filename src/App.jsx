import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Callback from './components/Callback'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import PlayerControls from './components/PlayerControls'
import { useEffect, useState } from 'react'

// Component to protect routes (only allows access if token exists)
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('spotify_access_token')
    return token ? children : <Navigate to="/login" />
}

// The main Visualizer Application (Placeholder for now)
const VisualizerApp = () => {

    const { player, isPaused, isActive, currentTrack, deviceId } = useSpotifyPlayer(token)

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/login'
    }

    const transferPlayback = async () => {
        if(!deviceId) return;
        await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                device_ids: [deviceId],
                play: true,
            })
        })
    }
    return (
        <div className="w-full h-screen bg-neutral-900 text-white flex flex-col items-center justify-center gap-8 relative overflow-hidden">

            <div className="z-10 flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold text-green-500">
                    Spotify Visualizer
                </h1>
                
                {isActive ? (
                    <PlayerControls
                        currentTrack={currentTrack}
                        isPaused={isPaused}
                        player={player}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-neutral-400">Player is ready but not active.</p>
                        {deviceId && (
                            <button
                                onClick={transferPlayback}
                                className="px-6 py-2 bg-green-500 text-black font-bold rounded-full hover:scale-105 transition"
                            >
                                Transfer Playback Here
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="mt-8 text-sm text-red-400 hover:text-red-300 underline cursor-pointer"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<Callback />} />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <VisualizerApp />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App