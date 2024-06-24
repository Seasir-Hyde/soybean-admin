import type { App } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createBuiltinVueRoutes } from './routes/builtin';
import { createRouterGuard } from './guard';

const { VITE_BASE_URL } = import.meta.env;

export const router = createRouter({
  history: createWebHashHistory(VITE_BASE_URL),
  routes: createBuiltinVueRoutes()
});

/** Setup Vue Router */
export async function setupRouter(app: App) {
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}
