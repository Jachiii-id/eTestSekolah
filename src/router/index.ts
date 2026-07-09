import { type RouteRecordName, createRouter, createWebHistory } from 'vue-router';

import { ensureResultDoc, getResultDocOnce } from '@/firebase/results';
import { useAuthStore } from '@/stores/auth';
import type { TestStatus } from '@/types';

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/confirm',
    name: 'identity-confirm',
    component: () => import('@/views/IdentityConfirmView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/token',
    name: 'token-gate',
    component: () => import('@/views/TokenGateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/completed',
    name: 'completed',
    component: () => import('@/views/CompletedView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

function resolveStudentRoute(status: TestStatus, identityConfirmed: boolean): RouteRecordName {
  if (status === 'completed') return 'completed';
  if (status === 'in_progress') return 'test';
  return identityConfirmed ? 'token-gate' : 'identity-confirm';
}

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.ready) {
    await auth.init();
  }

  if (to.meta.requiresAdmin) {
    if (!auth.isSignedIn || !auth.isAdmin) {
      return { name: 'admin-login' };
    }
    return true;
  }

  if (to.meta.requiresAuth) {
    if (!auth.isSignedIn) return { name: 'login' };
    if (auth.isAdmin) return { name: 'admin-dashboard' };

    await ensureResultDoc(auth.id!);
    const resultDoc = await getResultDocOnce(auth.id!);
    const target = resolveStudentRoute(resultDoc.status, auth.identityConfirmed);
    if (target !== to.name) return { name: target };
    return true;
  }

  // Public routes: bounce an already-authenticated user straight to where they belong.
  if (to.name === 'login' && auth.isSignedIn) {
    if (auth.isAdmin) return { name: 'admin-dashboard' };
    const resultDoc = await getResultDocOnce(auth.id!);
    return { name: resolveStudentRoute(resultDoc.status, auth.identityConfirmed) };
  }
  if (to.name === 'admin-login' && auth.isSignedIn && auth.isAdmin) {
    return { name: 'admin-dashboard' };
  }

  return true;
});
