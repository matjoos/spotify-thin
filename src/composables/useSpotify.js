import { useAuthStore } from '@/stores/auth'

export function useSpotify() {
  const auth = useAuthStore()

  async function api(endpoint, options = {}) {
    const token = await auth.getValidToken()
    if (!token) throw new Error('Not authenticated')

    const url = endpoint.startsWith('http')
      ? endpoint
      : `https://api.spotify.com/v1${endpoint}`

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (res.status === 204) return null
    if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
    return res.json()
  }

  async function search(query, types = 'track,album,artist,playlist', limit = 20) {
    if (!query.trim()) return null
    return api(`/search?q=${encodeURIComponent(query)}&type=${types}&limit=${limit}`)
  }

  async function getPlaylists(limit = 50, offset = 0) {
    return api(`/me/playlists?limit=${limit}&offset=${offset}`)
  }

  async function getPlaylist(id) {
    return api(`/playlists/${id}`)
  }

  async function getPlaylistTracks(id, limit = 100, offset = 0) {
    return api(`/playlists/${id}/tracks?limit=${limit}&offset=${offset}`)
  }

  async function getLikedSongs(limit = 50, offset = 0) {
    return api(`/me/tracks?limit=${limit}&offset=${offset}`)
  }

  async function getRecentlyPlayed(limit = 20) {
    return api(`/me/player/recently-played?limit=${limit}`)
  }

  async function getAlbum(id) {
    return api(`/albums/${id}`)
  }

  async function getArtist(id) {
    return api(`/artists/${id}`)
  }

  async function getArtistTopTracks(id) {
    return api(`/artists/${id}/top-tracks`)
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
