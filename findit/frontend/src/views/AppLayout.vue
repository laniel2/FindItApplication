<script setup>
import AppNavbar from '../components/AppNavbar.vue';
</script>

<template>
  <AppNavbar />
  <main class="container page">
    <!-- Child routes (Browse, Post, Profile...) render here -->
    <router-view />
  </main>
</template>
