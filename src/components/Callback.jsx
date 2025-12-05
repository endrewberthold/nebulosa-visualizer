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

            // 1. Get code from URL
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')

            // 2. Retrieve the verifier we saved earlier
            const codeVerifier = localStorage.getItem('spotify_code_verifier')

            if (code && codeVerifier) {
                try {
                    // 3. Exchange Code for Access Token
                    const body = new URLSearchParams({
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: spotifyConfig.redirectUri,
                        client_id: spotifyConfig.clientId,
                        code_verifier: codeVerifier,
                    })

                    const response = await fetch('https://accounts.spotify.com/api/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: body,
                    })

                    const data = await response.json()

                    if (data.access_token) {
                        // 4. Save token and redirect to main app
                        localStorage.setItem('spotify_access_token', data.access_token)
                        localStorage.setItem('spotify_refresh_token', data.refresh_token)
                        // Save expiration time (current time + expires_in seconds)
                        const expiresAt = Date.now() + (data.expires_in * 1000)
                        localStorage.setItem('spotify_token_expires_at', expiresAt)

                        navigate('/')
                    } else {
                        console.error('Token error:', data)
                        navigate('/login')
                    }
                } catch (error) {
                    console.error('Auth request failed:', error)
                    navigate('/login')
                }
            } else {
                navigate('/login')
            }
        }

        fetchToken()
    }, [navigate])

    return (
        <div className="h-screen bg-neutral-900 text-white flex items-center justify-center">
            <h2 className="text-2xl animate-pulse">Authenticating...</h2>
        </div>
    )
}

export default Callback