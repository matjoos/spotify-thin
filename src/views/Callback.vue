<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const error = ref(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const err = params.get('error')

  if (err) {
    error.value = `Spotify authorization failed: ${err}`
    return
  }

  if (!code) {
    error.value = 'No authorization code received'
    return
  }

  try {
    await auth.handleCallback(code)
    router.replace({ name: 'now-playing' })
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card max-width="400" class="pa-6 text-center" variant="outlined">
      <template v-if="error">
        <v-icon size="48" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <p class="text-body-1 mb-4">{{ error }}</p>
        <v-btn color="primary" @click="$router.replace('/')">Try Again</v-btn>
      </template>
      <template v-else>
        <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
        <p class="text-body-1">Connecting to Spotify...</p>
      </template>
    </v-card>
  </v-container>
</template>
