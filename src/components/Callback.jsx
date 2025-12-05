import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { spotifyConfig } from '../config/spotifyConfig'

const Callback = () => {
    const navigate = useNavigate()
    const called = useRef(false) // Trava para evitar execução dupla
    const [status, setStatus] = useState('Processando...')
    const [errorDetails, setErrorDetails] = useState(null)

    useEffect(() => {
        const fetchToken = async () => {
            // Evita que o React StrictMode rode isso 2 vezes e invalide o código
            if (called.current) return
            called.current = true

            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')
            const codeVerifier = localStorage.getItem('spotify_code_verifier')

            // Debug visual
            console.log('Code from URL:', code ? 'Sim' : 'Não')
            console.log('Verifier from LocalStorage:', codeVerifier)

            if (!code || !codeVerifier) {
                setStatus('Erro: Faltando código ou verificador.')
                setErrorDetails('Code ou Verifier nulo. Tente limpar o cache e logar de novo.')
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

                // URL ABSOLUTA E OFICIAL PARA O TOKEN
                const response = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body,
                })

                const data = await response.json()

                if (!response.ok) {
                    setStatus('Erro na resposta do Spotify')
                    setErrorDetails(JSON.stringify(data, null, 2))
                    return // PAUSA AQUI PARA LER O ERRO
                }

                if (data.access_token) {
                    localStorage.setItem('spotify_access_token', data.access_token)
                    localStorage.setItem('spotify_refresh_token', data.refresh_token)
                    const expiresAt = Date.now() + (data.expires_in * 1000)
                    localStorage.setItem('spotify_token_expires_at', expiresAt)

                    // Só redireciona se der TUDO certo
                    navigate('/')
                } else {
                    setStatus('Erro: Token não recebido')
                    setErrorDetails(JSON.stringify(data, null, 2))
                }

            } catch (error) {
                setStatus('Erro de Rede / Fetch')
                setErrorDetails(error.toString())
            }
        }

        fetchToken()
    }, [navigate])

    if (errorDetails) {
        return (
            <div className="h-screen bg-red-900 text-white p-10 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Autenticação Falhou</h1>
                <p className="text-xl mb-4">{status}</p>
                <pre className="bg-black p-4 rounded text-left overflow-auto max-w-2xl w-full">
          {errorDetails}
        </pre>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="mt-6 px-6 py-2 bg-white text-red-900 font-bold rounded cursor-pointer"
                >
                    Tentar Login Novamente
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen bg-neutral-900 text-white flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold animate-pulse">{status}</h2>
        </div>
    )
}

export default Callback