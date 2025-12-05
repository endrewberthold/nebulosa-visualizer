import { useState, useEffect } from 'react'

/**
 * Custom hook to handle Spotify Web Playback SDK initialization and state.
 * @param {string} token - The valid Spotify access token
 */
export const useSpotifyPlayer = (token) => {
    const [player, setPlayer] = useState(undefined)
    const [isPaused, setPaused] = useState(false)
    const [isActive, setActive] = useState(false)
    const [currentTrack, setCurrentTrack] = useState(null)
    const [deviceId, setDeviceId] = useState(null)

    useEffect(() => {
        if (!token) return

        // 1. Inject the Spotify Web Playback SDK script
        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        document.body.appendChild(script)

        // 2. Define the callback that Spotify calls when the SDK is ready
        window.onSpotifyWebPlaybackSDKReady = () => {
            const newPlayer = new window.Spotify.Player({
                name: 'React Visualizer Player',
                getOAuthToken: (cb) => {
                    cb(token)
                },
                volume: 0.5,
            })

            setPlayer(newPlayer)

            // 3. Add Event Listeners
            newPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id)
                setDeviceId(device_id)
            })

            newPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id)
            })

            newPlayer.addListener('player_state_changed', (state) => {
                if (!state) return

                setCurrentTrack(state.track_window.current_track)
                setPaused(state.paused)

                newPlayer.getCurrentState().then((playerState) => {
                    setActive(!!playerState)
                })
            })
            newPlayer.connect()
        }
        return () => {
            if (player) player.disconnect()
        }
    }, [token])

    return { player, isPaused, isActive, currentTrack, deviceId }
}