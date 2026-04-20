import type { App } from "vue"
import { createRouter, createWebHistory, createMemoryHistory } from "vue-router"
import ui from "@nuxt/ui/vue-plugin"

export default (app: App) => {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: { render: () => null } }]
  })
  app.use(router)
  app.use(ui)
}
