import { spotifyConfig } from '../config/spotifyConfig'
import { generateRandomString, generateCodeChallenge } from '../utils/authUtils'

const Login = () => {
    const handleLogin = async () => {
        // 1. Generate PKCE Verifier and Challenge
        const codeVerifier = generateRandomString(128)
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        // 2. Save verifier locally
        localStorage.setItem('spotify_code_verifier', codeVerifier)

        // 3. Construct Authorization URL
        const args = new URLSearchParams({
            response_type: 'code',
            client_id: spotifyConfig.clientId,
            scope: spotifyConfig.scopes.join(' '),
            redirect_uri: spotifyConfig.redirectUri,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
        })

        // 4. Redirect user to Spotify
        window.location.href = `${spotifyConfig.authEndpoint}/authorize?${args}`
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
            <h1 className="text-5xl font-bold mb-8">Nebulosa Audio Visualizer</h1>
            <button
                onClick={handleLogin}
                className="px-8 py-3 bg-green-500 text-black text-xl font-bold rounded-full hover:scale-105 transition-transform cursor-pointer"
            >
                Log in with Spotify
            </button>
        </div>
    )
}

export default Login