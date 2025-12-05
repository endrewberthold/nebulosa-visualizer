// src/App.jsx
import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginButton from './components/LoginButton';
import CallbackPage from './pages/Callback';

// Fallback Visualizer caso você não tenha um componente ainda
function FallbackVisualizer({ accessToken }) {
    const [trackId, setTrackId] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    async function fetchAudioAnalysis(trackIdToFetch) {
        if (!accessToken) return setError('No access token');
        try {
            setError(null);
            const resp = await fetch(`https://api.spotify.com/v1/audio-analysis/${trackIdToFetch}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
            const json = await resp.json();
            setAnalysis(json);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Nebulosa — Visualizer (test stub)</h2>
            <p>Cole um <b>trackId</b> (ex: 3n3Ppam7vgaVa1iaRUc9Lp) e pressione "Get Analysis".</p>

            <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value.trim())}
                placeholder="track id"
                style={{ padding: 8, width: 320 }}
            />
            <div style={{ marginTop: 8 }}>
                <button onClick={() => fetchAudioAnalysis(trackId)} disabled={!trackId || !accessToken}>
                    Get Analysis
                </button>
            </div>

            {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

            {analysis && (
                <div style={{ marginTop: 16 }}>
                    <h3>Analysis summary</h3>
                    <p>Beats: {analysis.beats?.length ?? 0} · Sections: {analysis.sections?.length ?? 0}</p>
                    <details style={{ maxWidth: 800 }}>
                        <summary>Raw analysis preview</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
              {JSON.stringify(
                  {
                      meta: { track: analysis.meta, bars: analysis.bars?.length, beats: analysis.beats?.length },
                      sectionsSample: analysis.sections?.slice(0, 3),
                      beatsSample: analysis.beats?.slice(0, 8)
                  },
                  null,
                  2
              )}
            </pre>
                    </details>
                </div>
            )}
        </div>
    );
}

// Context to expose the access token across the app (optional)
export const SpotifyContext = createContext({
    accessToken: null,
    setAccessToken: () => {}
});

export default function App() {
    const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('spotify_access_token') || null);
    const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('spotify_refresh_token') || null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        // keep sessionStorage in sync
        if (accessToken) sessionStorage.setItem('spotify_access_token', accessToken);
        else sessionStorage.removeItem('spotify_access_token');

        if (refreshToken) sessionStorage.setItem('spotify_refresh_token', refreshToken);
        else sessionStorage.removeItem('spotify_refresh_token');
    }, [accessToken, refreshToken]);

    useEffect(() => {
        // If we have an access token, try to fetch the user's profile as a quick sanity check
        async function fetchProfile() {
            if (!accessToken) return setProfile(null);
            try {
                const resp = await fetch('https://api.spotify.com/v1/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (!resp.ok) {
                    // token may have expired; we don't auto-refresh here, showing null profile is fine
                    setProfile(null);
                    return;
                }
                const json = await resp.json();
                setProfile(json);
            } catch (err) {
                console.error('fetchProfile error', err);
                setProfile(null);
            }
        }
        fetchProfile();
    }, [accessToken]);

    // Simple sign out
    const handleSignOut = () => {
        setAccessToken(null);
        setRefreshToken(null);
        setProfile(null);
        sessionStorage.removeItem('spotify_pkce_verifier');
        sessionStorage.removeItem('spotify_access_token');
        sessionStorage.removeItem('spotify_refresh_token');
    };

    return (
        <SpotifyContext.Provider value={{ accessToken, setAccessToken }}>
            <Router>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #eee' }}>
                    <div>
                        <Link to="/" style={{ marginRight: 12, textDecoration: 'none', fontWeight: 700 }}>Nebulosa</Link>
                        <Link to="/visualizer" style={{ marginRight: 12 }}>Visualizer</Link>
                    </div>
                    <div>
                        {profile ? (
                            <>
                                <span style={{ marginRight: 12 }}>Olá, {profile.display_name ?? profile.id}</span>
                                <button onClick={handleSignOut}>Sign out</button>
                            </>
                        ) : (
                            <LoginButton />
                        )}
                    </div>
                </div>

                <Routes>
                    <Route path="/Callback" element={<CallbackPage onTokens={(data) => {
                        // callback.jsx should POST to /api/exchange and then call this with the returned tokens
                        // We'll accept both forms: object or full response
                        if (!data) return;
                        const { access_token, refresh_token, expires_in } = data;
                        if (access_token) setAccessToken(access_token);
                        if (refresh_token) setRefreshToken(refresh_token);
                        // redirect to visualizer after tokens set
                        window.location.replace('/visualizer');
                    }} />} />

                    <Route path="/visualizer" element={
                        accessToken ? (
                            // If you have your own Visualizer component, replace FallbackVisualizer with it:
                            // <Visualizer accessToken={accessToken} />
                            <FallbackVisualizer accessToken={accessToken} />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    } />

                    <Route path="/" element={
                        <div style={{ padding: 24 }}>
                            <h1>Nebulosa Audio Visualizer</h1>
                            <p>Conecte sua conta Spotify para testar o fluxo PKCE e buscar <i>audio-analysis</i>.</p>

                            {!accessToken ? (
                                <>
                                    <p>Para começar: clique em <b>Conectar com Spotify</b>.</p>
                                    <LoginButton />
                                </>
                            ) : (
                                <>
                                    <p>Conectado. Vá para <Link to="/visualizer">Visualizer</Link> para testar.</p>
                                </>
                            )}

                            <hr style={{ margin: '24px 0' }} />

                            <details>
                                <summary>Debug (tokens/session)</summary>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
{JSON.stringify({
    accessToken: accessToken ? '***present***' : null,
    refreshToken: refreshToken ? '***present***' : null,
    profile: profile ? { id: profile.id, display_name: profile.display_name } : null
}, null, 2)}
                </pre>
                            </details>
                        </div>
                    } />
                </Routes>
            </Router>
        </SpotifyContext.Provider>
    );
}
