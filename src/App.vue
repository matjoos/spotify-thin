<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import PlayerBar from '@/components/PlayerBar.vue'
import AppNav from '@/components/AppNav.vue'

const auth = useAuthStore()
const player = usePlayerStore()
const router = useRouter()

onMounted(async () => {
  if (auth.isLoggedIn) {
    await auth.fetchUser()
    await player.initPlayer()
  }
})

watch(
  () => auth.isLoggedIn,
  async (loggedIn) => {
    if (loggedIn) {
      await auth.fetchUser()
      await player.initPlayer()
    }
  }
)

onUnmounted(() => {
  player.destroy()
})

function handleKeydown(e) {
  if (e.target.tagName === 'INPUT') return

  switch (e.code) {
    case 'Space':
      e.preventDefault()
      player.togglePlay()
      break
    case 'ArrowRight':
      if (e.shiftKey) player.nextTrack()
      else player.seek(player.position + 5000)
      break
    case 'ArrowLeft':
      if (e.shiftKey) player.previousTrack()
      else player.seek(Math.max(0, player.position - 5000))
      break
    case 'ArrowUp':
      e.preventDefault()
      player.setVolume(Math.min(100, player.volume + 5))
      break
    case 'ArrowDown':
      e.preventDefault()
      player.setVolume(Math.max(0, player.volume - 5))
      break
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <v-app>
    <template v-if="auth.isLoggedIn">
      <AppNav />
      <v-main class="d-flex flex-column" style="padding-bottom: 80px">
        <router-view />
      </v-main>
      <PlayerBar />
    </template>

    <template v-else>
      <v-main>
        <router-view />
        <v-container
          v-if="$route.name !== 'callback'"
          class="fill-height d-flex align-center justify-center"
        >
          <v-card max-width="440" class="pa-6 text-center" variant="outlined">
            <v-card-title class="text-h5 mb-2">Spotify Thin</v-card-title>
            <v-card-subtitle class="mb-4">Lightweight Spotify player</v-card-subtitle>

            <v-text-field
              v-if="auth.needsSetup"
              v-model="clientIdInput"
              label="Spotify Client ID"
              hint="From developer.spotify.com/dashboard"
              persistent-hint
              variant="outlined"
              class="mb-4"
              @keyup.enter="saveAndLogin"
            />

            <v-btn color="primary" size="large" block @click="saveAndLogin">
              <v-icon start>mdi-spotify</v-icon>
              Connect with Spotify
            </v-btn>

            <v-card-text class="text-caption mt-4 text-medium-emphasis">
              Requires a Spotify Developer app. Create one at
              <a href="https://developer.spotify.com/dashboard" target="_blank" class="text-primary">
                developer.spotify.com
              </a>
              with redirect URI: <code>http://localhost:5173/callback</code>
            </v-card-text>
          </v-card>
        </v-container>
      </v-main>
    </template>
  </v-app>
</template>

<script>
export default {
  data: () => ({ clientIdInput: '' }),
  methods: {
    saveAndLogin() {
      const auth = useAuthStore()
      if (this.clientIdInput.trim()) {
        auth.setClientId(this.clientIdInput.trim())
      }
      if (!auth.needsSetup) {
        auth.login()
      }
    },
  },
}
</script>
