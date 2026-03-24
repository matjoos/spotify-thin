<script setup>
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div v-if="player.currentTrack" class="text-center" style="max-width: 400px">
      <v-img
        :src="player.trackImage"
        aspect-ratio="1"
        class="rounded-lg mb-6 elevation-8"
        max-width="360"
        cover
      />
      <h2 class="text-h5 font-weight-bold mb-1">{{ player.trackTitle }}</h2>
      <p class="text-body-1 text-medium-emphasis mb-1">{{ player.trackArtist }}</p>
      <p class="text-caption text-medium-emphasis">{{ player.trackAlbum }}</p>
    </div>

    <div v-else class="text-center text-medium-emphasis">
      <v-icon size="80" class="mb-4">mdi-music-note</v-icon>
      <p class="text-h6">Nothing playing</p>
      <p class="text-body-2">Search for a song or pick a playlist to start listening.</p>
    </div>
  </v-container>
</template>
