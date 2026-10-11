import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import AppLayout from '../views/AppLayout.vue';

/**
 * ROUTE CONFIGURATION
 *  - nested routes:   AppLayout is the parent, pages render inside its <router-view>
 *  - lazy loading:    () => import(...) loads a page only when it's visited
 *  - dynamic params:  /items/:id  (props: true passes `id` to the page as a prop)
 *  - meta fields:     requiresAuth / guestOnly / title are read by the guards below
 *  - redirect + catch-all 404
 */
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Log in' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true, title: 'Create account' },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'items', component: () => import('../views/ItemsView.vue'), meta: { title: 'Browse items' } },
      { path: 'items/new', name: 'item-new', component: () => import('../views/ItemFormView.vue'), meta: { title: 'Post an item' } },
      { path: 'items/:id(\\d+)', name: 'item-detail', component: () => import('../views/ItemDetailView.vue'), props: true, meta: { title: 'Item details' } },
      { path: 'items/:id(\\d+)/edit', name: 'item-edit', component: () => import('../views/ItemFormView.vue'), props: true, meta: { title: 'Edit item' } },
      { path: 'profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { title: 'My profile' } },
    ],
  },
  { path: '/home', redirect: '/' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Page not found' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
});

// Navigation guard: protect pages and keep logged-in users out of the login page.
router.beforeEach((to) => {
  const { isLoggedIn } = useAuth();
  if (to.matched.some((r) => r.meta.requiresAuth) && !isLoggedIn.value) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && isLoggedIn.value) return { name: 'items' };
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · FindIt` : 'FindIt';
});

export default router;
