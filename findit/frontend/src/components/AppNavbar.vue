<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
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
        <router-link :to="{ name: 'items' }" exact-active-class="active">Browse</router-link>
        <router-link :to="{ name: 'item-new' }" active-class="active">Post an item</router-link>
      </nav>

      <div class="top-user">
        <router-link :to="{ name: 'profile' }" class="user-chip" aria-label="My profile">
          <UserAvatar :user="user" :size="34" />
          <span class="user-name">{{ user?.name }}</span>
        </router-link>
        <button type="button" class="btn btn-light btn-sm" @click="onLogout">
          <i class="bi bi-box-arrow-right"></i><span class="d-none d-sm-inline ms-1">Log out</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Phone navigation -->
  <nav class="bottom-nav" aria-label="Main (mobile)">
    <router-link :to="{ name: 'items' }" exact-active-class="active"><i class="bi bi-search"></i>Browse</router-link>
    <router-link :to="{ name: 'item-new' }" active-class="active"><i class="bi bi-plus-circle"></i>Post</router-link>
    <router-link :to="{ name: 'profile' }" active-class="active"><i class="bi bi-person"></i>Profile</router-link>
  </nav>
</template>
