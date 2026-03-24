<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSpotify } from '@/composables/useSpotify'
import { usePlayerStore } from '@/stores/player'
import TrackList from '@/components/TrackList.vue'

const route = useRoute()
const { getPlaylist, getPlaylistTracks } = useSpotify()
const player = usePlayerStore()

const playlist = ref(null)
const tracks = ref([])
const loading = ref(false)

async function load(id) {
  loading.value = true
  try {
    const [pl, tr] = await Promise.all([getPlaylist(id), getPlaylistTracks(id)])
    playlist.value = pl
    tracks.value = tr.items
  } catch (e) {
    console.error('Failed to load playlist:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => load(route.params.id))
watch(() => route.params.id, (id) => { if (id) load(id) })

function playAll() {
  if (playlist.value) {
    player.playContext(playlist.value.uri)
  }
}
</script>

<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-if="playlist">
      <div class="d-flex align-start mb-6 ga-4">
        <v-img
          :src="playlist.images?.[0]?.url"
          width="180"
          height="180"
          class="rounded-lg flex-shrink-0 elevation-4"
          cover
        />
        <div>
          <p class="text-overline text-medium-emphasis">Playlist</p>
          <h2 class="text-h4 font-weight-bold mb-1">{{ playlist.name }}</h2>
          <p v-if="playlist.description" class="text-body-2 text-medium-emphasis mb-2">
            {{ playlist.description }}
          </p>
          <p class="text-caption text-medium-emphasis">
            {{ playlist.tracks?.total || 0 }} songs
          </p>
          <v-btn color="primary" class="mt-3" prepend-icon="mdi-play" @click="playAll">
            Play All
          </v-btn>
        </div>
      </div>

      <TrackList :tracks="tracks" :context-uri="playlist.uri" />
    </template>
  </v-container>
</template>
