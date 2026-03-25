<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSpotify } from '@/composables/useSpotify'
import { usePlayerStore } from '@/stores/player'
import TrackList from '@/components/TrackList.vue'

const router = useRouter()
const { getPlaylists, getLikedSongs } = useSpotify()
const player = usePlayerStore()

const tab = ref('playlists')
const playlists = ref([])
const likedSongs = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const [pl, liked] = await Promise.all([getPlaylists(), getLikedSongs()])
    playlists.value = pl.items
    likedSongs.value = liked.items
  } catch (e) {
    console.error('Failed to load library:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container>
    <h2 class="text-h5 font-weight-bold mb-4">Your Library</h2>

    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="playlists">Playlists</v-tab>
      <v-tab value="liked">Liked Songs</v-tab>
    </v-tabs>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="playlists">
        <v-row dense>
          <v-col
            v-for="pl in playlists"
            :key="pl.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <v-card
              variant="tonal"
              rounded="lg"
              class="pa-3"
              hover
              @click="router.push({ name: 'playlist', params: { id: pl.id } })"
            >
              <v-img
                :src="pl.images?.[0]?.url"
                aspect-ratio="1"
                class="rounded mb-2"
                cover
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-surface-variant">
                    <v-icon size="48">mdi-playlist-music</v-icon>
                  </div>
                </template>
              </v-img>
              <div class="text-body-2 text-truncate font-weight-medium">{{ pl.name }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ pl.tracks?.total || 0 }} songs
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item value="liked">
        <TrackList :tracks="likedSongs" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>
