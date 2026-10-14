<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
import AccountSwitcher from './AccountSwitcher.vue';
import UserAvatar from './UserAvatar.vue';

const { user, logout } = useAuth();
const router = useRouter();
const toast = useToast();

function onLogout() {
  logout();
  toast.success('You are logged out');
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="topbar">
    <div class="container topbar-inner">
      <router-link to="/" class="brand" aria-label="FindIt home">
        <span class="brand-mark"><i class="bi bi-tag-fill"></i></span>
        <span>FindIt</span>
      </router-link>

      <nav class="top-links" aria-label="Main">
        <router-link :to="{ name: 'items' }" :class="{ active: $route.name === 'items' && !$route.query.view }">Browse</router-link>
        <router-link :to="{ name: 'items', query: { view: 'my-lost' } }" :class="{ active: $route.query.view === 'my-lost' }">My lost items</router-link>
        <router-link :to="{ name: 'items', query: { view: 'my-returned' } }" :class="{ active: $route.query.view === 'my-returned' }">My returned items</router-link>
        <router-link :to="{ name: 'item-new' }" active-class="active">Post an item</router-link>
      </nav>

      <div class="top-user">
        <AccountSwitcher />
        <router-link :to="{ name: 'profile' }" class="user-chip" aria-label="My profile">
          <UserAvatar :user="user" :size="34" />
          <span class="user-name">{{ user?.name }}<small v-if="user?.role === 'admin'" class="d-block">Admin</small></span>
        </router-link>
        <button type="button" class="btn btn-light btn-sm" @click="onLogout">
          <i class="bi bi-box-arrow-right"></i><span class="d-none d-sm-inline ms-1">Log out</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Phone navigation -->
  <nav class="bottom-nav" aria-label="Main (mobile)">
    <router-link :to="{ name: 'items' }" :class="{ active: $route.name === 'items' && !$route.query.view }"><i class="bi bi-search"></i>Browse</router-link>
    <router-link :to="{ name: 'items', query: { view: 'my-lost' } }" :class="{ active: $route.query.view === 'my-lost' }"><i class="bi bi-exclamation-circle"></i>My lost</router-link>
    <router-link :to="{ name: 'items', query: { view: 'my-returned' } }" :class="{ active: $route.query.view === 'my-returned' }"><i class="bi bi-check2-circle"></i>Returned</router-link>
    <router-link :to="{ name: 'item-new' }" active-class="active"><i class="bi bi-plus-circle"></i>Post</router-link>
    <router-link :to="{ name: 'profile' }" active-class="active"><i class="bi bi-person"></i>Profile</router-link>
  </nav>
</template>
