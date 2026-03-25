import { useAuthStore } from '@/stores/auth'

export function useSpotify() {
  const auth = useAuthStore()

  async function api(endpoint, options = {}) {
    const token = await auth.getValidToken()
    if (!token) throw new Error('Not authenticated')

    const url = endpoint.startsWith('http')
      ? endpoint
      : `https://api.spotify.com/v1${endpoint}`

    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    }

    if (options.method && options.method !== 'GET' && options.body) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (res.status === 204) return null
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`Spotify API error: ${res.status} - ${url}`, body)
      if (res.status === 401) {
        auth.logout()
      }
      throw new Error(`${res.status} ${url}\n${body}`)
    }
    return res.json()
  }

  // Manual URL builder that does NOT encode commas (Spotify requires literal commas)
  function buildUrl(path, params = {}) {
    const parts = []
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      }
    }
    const base = `https://api.spotify.com/v1${path}`
    // Restore literal commas — Spotify API requires them unencoded
    const query = parts.join('&').replace(/%2C/gi, ',')
    return parts.length ? `${base}?${query}` : base
  }

  async function search(query, type = 'track') {
    if (!query || !String(query).trim()) return null
    const q = encodeURIComponent(String(query).trim())
    return api(`https://api.spotify.com/v1/search?q=${q}&type=${type}`)
  }

  async function getPlaylists() {
    // Dev mode blocks limit param on some endpoints
    return api(buildUrl('/me/playlists'))
  }

  async function getPlaylist(id) {
    return api(buildUrl(`/playlists/${id}`))
  }

  async function getPlaylistTracks(id) {
    // Dev mode blocks /playlists/{id}/tracks — get tracks from the main playlist object instead
    const playlist = await api(buildUrl(`/playlists/${id}`))
    return playlist.tracks || { items: [] }
  }

  async function getLikedSongs() {
    return api(buildUrl('/me/tracks'))
  }

  async function getRecentlyPlayed() {
    return api(buildUrl('/me/player/recently-played'))
  }

  async function getAlbum(id) {
    return api(buildUrl(`/albums/${id}`))
  }

  async function getArtist(id) {
    return api(buildUrl(`/artists/${id}`))
  }

  async function getArtistTopTracks(id) {
    return api(buildUrl(`/artists/${id}/top-tracks`))
  }

  return {
    api,
    search,
    getPlaylists,
    getPlaylist,
    getPlaylistTracks,
    getLikedSongs,
    getRecentlyPlayed,
    getAlbum,
    getArtist,
    getArtistTopTracks,
  }
}
