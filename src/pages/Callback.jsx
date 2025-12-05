import React, { useEffect } from 'react';

export default function Callback() {
    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        const code = q.get('code');
        const state = q.get('state');
        if (!code) {
            console.error('No code in callback');
            return;
        }
        // envia o code + verifier para sua rota serverless que troca tokens
        const verifier = sessionStorage.getItem('spotify_pkce_verifier');
        fetch('/api/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, verifier, redirect_uri: window.location.origin + '/callback' })
        })
            .then(r => r.json())
            .then(data => {
                // data: { access_token, refresh_token, expires_in }
                sessionStorage.setItem('spotify_access_token', data.access_token);
                sessionStorage.setItem('spotify_refresh_token', data.refresh_token);
                // redireciona para a UI principal
                window.location = '/';
            })
            .catch(console.error);
    }, []);
    return <div>Finalizando autenticação com Spotify...</div>;
}
