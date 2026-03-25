<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const repeatIcon = computed(() => {
  const icons = ['mdi-repeat', 'mdi-repeat', 'mdi-repeat-once']
  return icons[player.repeatMode]
})

const repeatColor = computed(() => (player.repeatMode > 0 ? 'primary' : undefined))

function onSeek(value) {
  player.seek(value)
}
</script>

<template>
  <v-footer app fixed class="pa-0" style="z-index: 10">
    <v-card
      flat
      tile
      width="100%"
      color="surface-variant"
      class="d-flex align-center px-4"
      style="height: 80px"
    >
      <!-- Track info -->
      <div class="d-flex align-center" style="width: 240px; min-width: 180px">
        <v-avatar size="56" rounded="sm" class="mr-3" v-if="player.trackImage">
          <v-img :src="player.trackImage" cover />
        </v-avatar>
        <div class="overflow-hidden">
          <div v-if="player.playerError" class="text-caption text-error text-truncate">{{ player.playerError }}</div>
          <div v-else-if="!player.isReady" class="text-caption text-warning text-truncate">SDK connecting...</div>
          <template v-else>
            <div class="text-body-2 text-truncate font-weight-medium">{{ player.trackTitle }}</div>
            <div class="text-caption text-medium-emphasis text-truncate">{{ player.trackArtist }}</div>
          </template>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex-grow-1 d-flex flex-column align-center justify-center mx-4">
        <div class="d-flex align-center ga-1">
          <v-btn
            icon="mdi-shuffle-variant"
            size="small"
            :color="player.shuffle ? 'primary' : undefined"
            @click="player.toggleShuffle()"
          />
          <v-btn icon="mdi-skip-previous" size="small" @click="player.previousTrack()" />
          <v-btn
            :icon="player.isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle'"
            size="large"
            color="white"
            @click="player.togglePlay()"
          />
          <v-btn icon="mdi-skip-next" size="small" @click="player.nextTrack()" />
          <v-btn
            :icon="repeatIcon"
            size="small"
            :color="repeatColor"
            @click="player.cycleRepeat()"
          />
        </div>

        <div class="d-flex align-center w-100" style="max-width: 500px">
          <span class="text-caption text-medium-emphasis mr-2" style="width: 40px; text-align: right">
            {{ formatTime(player.position) }}
          </span>
          <v-slider
            :model-value="player.position"
            :max="player.duration || 1"
            :step="1000"
            hide-details
            density="compact"
            class="mx-1"
            @update:model-value="onSeek"
          />
          <span class="text-caption text-medium-emphasis ml-2" style="width: 40px">
            {{ formatTime(player.duration) }}
          </span>
        </div>
      </div>

      <!-- Volume -->
      <div class="d-flex align-center" style="width: 160px; min-width: 120px">
        <v-btn
          :icon="player.volume === 0 ? 'mdi-volume-off' : player.volume < 50 ? 'mdi-volume-medium' : 'mdi-volume-high'"
          size="small"
          @click="player.setVolume(player.volume === 0 ? 50 : 0)"
        />
        <v-slider
          :model-value="player.volume"
          :max="100"
          :step="1"
          hide-details
          density="compact"
          class="ml-1"
          @update:model-value="player.setVolume($event)"
        />
      </div>
    </v-card>
  </v-footer>
</template>
