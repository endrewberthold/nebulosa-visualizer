import React from 'react';
import { generateRandomString, createCodeChallenge } from '../utils/pkce';

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const scopes = [
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
].join(' ');

export default function LoginButton() {
    const handleLogin = async () => {
        const verifier = generateRandomString(64);
        const challenge = await createCodeChallenge(verifier);
        sessionStorage.setItem('spotify_pkce_verifier', verifier); // temporário
        const state = generateRandomString(16);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scopes,
            redirect_uri: redirectUri,
            state,
            code_challenge_method: 'S256',
            code_challenge: challenge
        });

        window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    return <button onClick={handleLogin}>Conectar com Spotify</button>;
}
