<script setup>
import { ref, watch } from 'vue'
import { useSpotify } from '@/composables/useSpotify'
import { usePlayerStore } from '@/stores/player'
import TrackList from '@/components/TrackList.vue'

const { search } = useSpotify()
const player = usePlayerStore()

const query = ref('')
const searchType = ref('track')
const results = ref(null)
const loading = ref(false)
const error = ref(null)

let debounceTimer = null

watch([query, searchType], () => {
  clearTimeout(debounceTimer)
  if (!query.value || !query.value.trim()) {
    results.value = null
    error.value = null
    return
  }
  debounceTimer = setTimeout(doSearch, 400)
})

async function doSearch() {
  if (!query.value.trim()) {
    results.value = null
    return
  }
  loading.value = true
  error.value = null
  try {
    results.value = await search(query.value, searchType.value)
  } catch (e) {
    console.error('Search failed:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container>
    <v-text-field
      v-model="query"
      placeholder="What do you want to listen to?"
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      rounded
      hide-details
      autofocus
      clearable
      class="mb-4"
      @click:clear="query = ''"
    />

    <v-btn-toggle v-model="searchType" mandatory color="primary" density="compact" class="mb-4">
      <v-btn value="track" size="small">Songs</v-btn>
      <v-btn value="album" size="small">Albums</v-btn>
      <v-btn value="artist" size="small">Artists</v-btn>
      <v-btn value="playlist" size="small">Playlists</v-btn>
    </v-btn-toggle>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <template v-if="results">
      <!-- Tracks -->
      <TrackList v-if="results.tracks?.items?.length" :tracks="results.tracks.items" />

      <!-- Albums -->
      <v-row v-if="results.albums?.items?.length" dense>
        <v-col
          v-for="album in results.albums.items"
          :key="album.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card variant="tonal" rounded="lg" class="pa-3" hover @click="player.playContext(album.uri)">
            <v-img :src="album.images?.[0]?.url" aspect-ratio="1" class="rounded mb-2" cover />
            <div class="text-body-2 text-truncate font-weight-medium">{{ album.name }}</div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ album.artists?.map((a) => a.name).join(', ') }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Artists -->
      <v-row v-if="results.artists?.items?.length" dense>
        <v-col
          v-for="artist in results.artists.items"
          :key="artist.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card variant="tonal" rounded="lg" class="pa-3 text-center" hover>
            <v-avatar size="100" class="mb-2">
              <v-img v-if="artist.images?.[0]?.url" :src="artist.images[0].url" cover />
              <v-icon v-else size="48">mdi-account-music</v-icon>
            </v-avatar>
            <div class="text-body-2 text-truncate font-weight-medium">{{ artist.name }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Playlists -->
      <v-row v-if="results.playlists?.items?.length" dense>
        <v-col
          v-for="pl in results.playlists.items"
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
            :to="{ name: 'playlist', params: { id: pl.id } }"
          >
            <v-img :src="pl.images?.[0]?.url" aspect-ratio="1" class="rounded mb-2" cover>
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height bg-surface-variant">
                  <v-icon size="48">mdi-playlist-music</v-icon>
                </div>
              </template>
            </v-img>
            <div class="text-body-2 text-truncate font-weight-medium">{{ pl.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ pl.tracks?.total || 0 }} songs</div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <div v-else-if="!loading && !error" class="text-center text-medium-emphasis mt-12">
      <v-icon size="60" class="mb-4">mdi-magnify</v-icon>
      <p class="text-body-1">Search for songs, albums, or artists</p>
    </div>
  </v-container>
</template>
