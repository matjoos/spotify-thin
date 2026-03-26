import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ')

const REDIRECT_URI = 'http://127.0.0.1:5173/callback'

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values, (v) => chars[v % chars.length]).join('')
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const CLIENT_ID = '04cc0ea80b69446aa562ade9d971db4c'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('spotify_access_token') || '')
  const refreshToken = ref(localStorage.getItem('spotify_refresh_token') || '')
  const expiresAt = ref(Number(localStorage.getItem('spotify_expires_at')) || 0)
  const clientId = ref(CLIENT_ID)
  const user = ref(null)

  const isLoggedIn = computed(() => !!accessToken.value && Date.now() < expiresAt.value)

  function saveTokens(data) {
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token || refreshToken.value
    expiresAt.value = Date.now() + data.expires_in * 1000

    localStorage.setItem('spotify_access_token', accessToken.value)
    localStorage.setItem('spotify_refresh_token', refreshToken.value)
    localStorage.setItem('spotify_expires_at', String(expiresAt.value))
  }

  async function login() {
    const verifier = generateRandomString(64)
    const challenge = base64urlEncode(await sha256(verifier))

    localStorage.setItem('spotify_code_verifier', verifier)

    const params = new URLSearchParams({
      client_id: clientId.value,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params}`

    window.location.href = authUrl
  }

  async function handleCallback(code) {
    const verifier = localStorage.getItem('spotify_code_verifier')
    if (!verifier) throw new Error('No code verifier found')

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId.value,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    })

    if (!response.ok) throw new Error('Token exchange failed')

    const data = await response.json()
    saveTokens(data)
    localStorage.removeItem('spotify_code_verifier')
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) return false

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId.value,
        grant_type: 'refresh_token',
        refresh_token: refreshToken.value,
      }),
    })

    if (!response.ok) return false

    const data = await response.json()
    saveTokens(data)
    return true
  }

  async function getValidToken() {
    if (Date.now() >= expiresAt.value - 60000) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) return null
    }
    return accessToken.value
  }

  async function fetchUser() {
    const token = await getValidToken()
    if (!token) return

    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) user.value = await res.json()
  }

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
    expiresAt.value = 0
    user.value = null
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_expires_at')
    localStorage.removeItem('spotify_code_verifier')
    // Force page reload to clear all state
    window.location.reload()
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    clientId,
    user,
    isLoggedIn,
    login,
    handleCallback,
    getValidToken,
    fetchUser,
    logout,
  }
})
