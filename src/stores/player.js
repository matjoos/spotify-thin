import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const usePlayerStore = defineStore('player', () => {
  const auth = useAuthStore()

  const player = ref(null)
  const deviceId = ref(null)
  const isReady = ref(false)
  const isPlaying = ref(false)
  const currentTrack = ref(null)
  const position = ref(0)
  const duration = ref(0)
  const volume = ref(50)
  const shuffle = ref(false)
  const repeatMode = ref(0) // 0=off, 1=context, 2=track

  let positionInterval = null

  const progress = computed(() => (duration.value > 0 ? position.value / duration.value : 0))

  const trackTitle = computed(() => currentTrack.value?.name || '')
  const trackArtist = computed(() =>
    currentTrack.value?.artists?.map((a) => a.name).join(', ') || ''
  )
  const trackAlbum = computed(() => currentTrack.value?.album?.name || '')
  const trackImage = computed(() => currentTrack.value?.album?.images?.[0]?.url || '')

  async function initPlayer() {
    return new Promise((resolve) => {
      window.onSpotifyWebPlaybackSDKReady = async () => {
        const token = await auth.getValidToken()
        if (!token) return resolve(false)

        const p = new window.Spotify.Player({
          name: 'Spotify Thin',
          getOAuthToken: async (cb) => {
            const t = await auth.getValidToken()
            cb(t)
          },
          volume: volume.value / 100,
        })

        p.addListener('ready', ({ device_id }) => {
          deviceId.value = device_id
          isReady.value = true
          transferPlayback(device_id)
          resolve(true)
        })

        p.addListener('not_ready', () => {
          isReady.value = false
        })

        p.addListener('player_state_changed', (state) => {
          if (!state) return
          isPlaying.value = !state.paused
          currentTrack.value = state.track_window.current_track
          position.value = state.position
          duration.value = state.duration
          shuffle.value = state.shuffle
          repeatMode.value = state.repeat_mode

          clearInterval(positionInterval)
          if (!state.paused) {
            positionInterval = setInterval(() => {
              position.value += 250
            }, 250)
          }
        })

        p.addListener('initialization_error', ({ message }) => {
          console.error('Init error:', message)
        })

        p.addListener('authentication_error', ({ message }) => {
          console.error('Auth error:', message)
        })

        p.addListener('account_error', ({ message }) => {
          console.error('Account error:', message)
        })

        await p.connect()
        player.value = p
      }

      // If SDK already loaded, trigger manually
      if (window.Spotify) {
        window.onSpotifyWebPlaybackSDKReady()
      }
    })
  }

  async function transferPlayback(id) {
    const token = await auth.getValidToken()
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [id], play: false }),
    })
  }

  async function togglePlay() {
    await player.value?.togglePlay()
  }

  async function nextTrack() {
    await player.value?.nextTrack()
  }

  async function previousTrack() {
    await player.value?.previousTrack()
  }

  async function seek(ms) {
    await player.value?.seek(ms)
    position.value = ms
  }

  async function setVolume(pct) {
    volume.value = pct
    await player.value?.setVolume(pct / 100)
  }

  async function playContext(contextUri, offset = 0) {
    const token = await auth.getValidToken()
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context_uri: contextUri,
        offset: { position: offset },
      }),
    })
  }

  async function playUris(uris) {
    const token = await auth.getValidToken()
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris }),
    })
  }

  async function toggleShuffle() {
    const token = await auth.getValidToken()
    shuffle.value = !shuffle.value
    await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${shuffle.value}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async function cycleRepeat() {
    const token = await auth.getValidToken()
    const modes = ['off', 'context', 'track']
    repeatMode.value = (repeatMode.value + 1) % 3
    await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${modes[repeatMode.value]}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  function destroy() {
    clearInterval(positionInterval)
    player.value?.disconnect()
    player.value = null
    isReady.value = false
  }

  return {
    player,
    deviceId,
    isReady,
    isPlaying,
    currentTrack,
    position,
    duration,
    volume,
    shuffle,
    repeatMode,
    progress,
    trackTitle,
    trackArtist,
    trackAlbum,
    trackImage,
    initPlayer,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    playContext,
    playUris,
    toggleShuffle,
    cycleRepeat,
    destroy,
  }
})
