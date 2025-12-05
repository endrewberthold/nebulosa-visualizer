/**
 * Configuration for Spotify API Integration.
 */

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI

const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
]

export const spotifyConfig = {
    clientId,
    redirectUri,
    scopes,
    // Helper to generate the login URL
    authEndpoint: 'https://accounts.spotify.com',
}