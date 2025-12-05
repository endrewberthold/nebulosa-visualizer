import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { refresh_token } = req.body;
    const client_id = process.env.VITE_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;

    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    const data = await tokenRes.json();
    res.status(200).json(data);
}
