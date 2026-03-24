<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSpotify } from '@/composables/useSpotify'

const router = useRouter()
const auth = useAuthStore()
const { getPlaylists } = useSpotify()

const playlists = ref([])
const rail = ref(false)

onMounted(async () => {
  try {
    const data = await getPlaylists()
    playlists.value = data.items
  } catch (e) {
    console.error('Failed to load playlists:', e)
  }
})

function navigatePlaylist(id) {
  router.push({ name: 'playlist', params: { id } })
}
</script>

<template>
  <v-navigation-drawer :rail="rail" permanent color="surface" width="260">
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-music-note"
        title="Now Playing"
        :to="{ name: 'now-playing' }"
      />
      <v-list-item
        prepend-icon="mdi-magnify"
        title="Search"
        :to="{ name: 'search' }"
      />
      <v-list-item
        prepend-icon="mdi-bookshelf"
        title="Library"
        :to="{ name: 'library' }"
      />
    </v-list>

    <v-divider class="my-2" />

    <v-list density="compact" nav class="overflow-y-auto">
      <v-list-subheader>Playlists</v-list-subheader>
      <v-list-item
        v-for="pl in playlists"
        :key="pl.id"
        :title="pl.name"
        @click="navigatePlaylist(pl.id)"
        class="text-truncate"
      >
        <template #prepend>
          <v-avatar size="32" rounded="sm" class="mr-2">
            <v-img
              v-if="pl.images?.[0]?.url"
              :src="pl.images[0].url"
              cover
            />
            <v-icon v-else size="20">mdi-playlist-music</v-icon>
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <v-list-item
        :title="auth.user?.display_name || 'User'"
        :subtitle="auth.user?.email"
        density="compact"
        class="pa-2"
      >
        <template #append>
          <v-btn icon="mdi-logout" size="small" variant="text" @click="auth.logout()" />
        </template>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>
