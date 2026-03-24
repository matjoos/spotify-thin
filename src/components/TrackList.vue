<script setup>
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  tracks: { type: Array, default: () => [] },
  contextUri: { type: String, default: null },
})

const player = usePlayerStore()

function play(index) {
  if (props.contextUri) {
    player.playContext(props.contextUri, index)
  } else {
    const uris = props.tracks.map((t) => t.uri || t.track?.uri).filter(Boolean)
    player.playUris(uris.slice(index))
  }
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function getTrack(item) {
  return item.track || item
}
</script>

<template>
  <v-list density="compact" class="bg-transparent">
    <v-list-item
      v-for="(item, i) in tracks"
      :key="getTrack(item).id || i"
      @click="play(i)"
      @dblclick="play(i)"
      class="rounded"
    >
      <template #prepend>
        <span class="text-caption text-medium-emphasis mr-3" style="width: 24px; text-align: right">
          {{ i + 1 }}
        </span>
        <v-avatar size="40" rounded="sm" class="mr-3">
          <v-img
            v-if="getTrack(item).album?.images?.[0]?.url"
            :src="getTrack(item).album.images[0].url"
            cover
          />
          <v-icon v-else>mdi-music-note</v-icon>
        </v-avatar>
      </template>

      <v-list-item-title class="text-body-2">
        {{ getTrack(item).name }}
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption">
        {{ getTrack(item).artists?.map((a) => a.name).join(', ') }}
        <span class="mx-1">&bull;</span>
        {{ getTrack(item).album?.name }}
      </v-list-item-subtitle>

      <template #append>
        <span class="text-caption text-medium-emphasis">
          {{ formatDuration(getTrack(item).duration_ms) }}
        </span>
      </template>
    </v-list-item>
  </v-list>
</template>
