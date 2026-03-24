<script setup>
import { ref } from 'vue'
import { useSpotify } from '@/composables/useSpotify'
import TrackList from '@/components/TrackList.vue'

const { search } = useSpotify()

const query = ref('')
const results = ref(null)
const loading = ref(false)

let debounceTimer = null

function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doSearch, 350)
}

async function doSearch() {
  if (!query.value.trim()) {
    results.value = null
    return
  }
  loading.value = true
  try {
    results.value = await search(query.value)
  } catch (e) {
    console.error('Search failed:', e)
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
      class="mb-6"
      @input="onInput"
      @click:clear="results = null"
    />

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-if="results">
      <!-- Tracks -->
      <div v-if="results.tracks?.items?.length" class="mb-6">
        <h3 class="text-h6 mb-2">Songs</h3>
        <TrackList :tracks="results.tracks.items" />
      </div>

      <!-- Albums -->
      <div v-if="results.albums?.items?.length" class="mb-6">
        <h3 class="text-h6 mb-2">Albums</h3>
        <v-row dense>
          <v-col
            v-for="album in results.albums.items.slice(0, 6)"
            :key="album.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <v-card variant="tonal" rounded="lg" class="pa-3" hover>
              <v-img
                :src="album.images?.[0]?.url"
                aspect-ratio="1"
                class="rounded mb-2"
                cover
              />
              <div class="text-body-2 text-truncate font-weight-medium">{{ album.name }}</div>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ album.artists?.map((a) => a.name).join(', ') }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Artists -->
      <div v-if="results.artists?.items?.length" class="mb-6">
        <h3 class="text-h6 mb-2">Artists</h3>
        <v-row dense>
          <v-col
            v-for="artist in results.artists.items.slice(0, 6)"
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
      </div>
    </template>

    <div v-else-if="!loading" class="text-center text-medium-emphasis mt-12">
      <v-icon size="60" class="mb-4">mdi-magnify</v-icon>
      <p class="text-body-1">Search for songs, albums, or artists</p>
    </div>
  </v-container>
</template>
