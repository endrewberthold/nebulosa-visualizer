// cria code_verifier e code_challenge (PKCE)
export function generateRandomString(length = 64) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map(v => possible[v % possible.length]).join('');
}

function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(plain) {
    const enc = new TextEncoder();
    const data = enc.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
}

export async function createCodeChallenge(verifier) {
    const hashed = await sha256(verifier);
    return base64UrlEncode(hashed);
}
