import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { spotifyConfig } from '../config/spotifyConfig'

const Callback = () => {
    const navigate = useNavigate()
    const called = useRef(false)

    useEffect(() => {
        const fetchToken = async () => {
            if (called.current) return
            called.current = true

            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')
            const codeVerifier = localStorage.getItem('spotify_code_verifier')

            if (!code || !codeVerifier) {
                console.error('Missing code or verifier')
                navigate('/login')
                return
            }

            try {
                const body = new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: spotifyConfig.redirectUri,
                    client_id: spotifyConfig.clientId,
                    code_verifier: codeVerifier,
                })

                // URL OFICIAL DO SPOTIFY PARA TOKEN:
                const response = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body,
                })

                if (!response.ok) {
                    // Se der erro, vamos ver o que o Spotify respondeu
                    const errorData = await response.json();
                    console.error('Spotify Token Error:', errorData);
                    alert(`Erro na autenticação: ${JSON.stringify(errorData)}`); // Alerta visual
                    navigate('/login');
                    return;
                }

                const data = await response.json()

                if (data.access_token) {
                    localStorage.setItem('spotify_access_token', data.access_token)
                    localStorage.setItem('spotify_refresh_token', data.refresh_token)
                    const expiresAt = Date.now() + (data.expires_in * 1000)
                    localStorage.setItem('spotify_token_expires_at', expiresAt)

                    navigate('/')
                } else {
                    console.error('No access token in response', data)
                    navigate('/login')
                }
            } catch (error) {
                console.error('Network Request Failed:', error)
                navigate('/login')
            }
        }

        fetchToken()
    }, [navigate])

    return (
        <div className="h-screen bg-neutral-900 text-white flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold animate-pulse">Finalizing connection...</h2>
            <p className="text-neutral-400">Please wait while we exchange keys.</p>
        </div>
    )
}

export default Callback