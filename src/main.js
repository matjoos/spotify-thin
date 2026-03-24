import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import vuetify from './plugins/vuetify'
import App from './App.vue'

const routes = [
  { path: '/', name: 'now-playing', component: () => import('./views/NowPlaying.vue') },
  { path: '/search', name: 'search', component: () => import('./views/Search.vue') },
  { path: '/library', name: 'library', component: () => import('./views/Library.vue') },
  { path: '/playlist/:id', name: 'playlist', component: () => import('./views/Playlist.vue') },
  { path: '/callback', name: 'callback', component: () => import('./views/Callback.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.use(router)
app.mount('#app')
