// authUtils.js
export const generateRandomString = (length = 128) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    let str = ''
    for (let i = 0; i < values.length; i++) {
        str += possible[values[i] % possible.length]
    }
    return str
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return await window.crypto.subtle.digest('SHA-256', data)
}

const base64UrlEncode = (arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    // btoa on relatively small strings is fine
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export const generateCodeChallenge = async (codeVerifier) => {
    const hashed = await sha256(codeVerifier)
    return base64UrlEncode(hashed)
}
