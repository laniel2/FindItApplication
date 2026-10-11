<script>
// OPTIONS API version of a component: data / props / computed / methods / mixins.
// Compare it with ItemCard.vue and ItemsView.vue, which use <script setup> (Composition API).
import formatMixin from '../mixins/formatMixin';

export default {
  name: 'StatsPanel',
  mixins: [formatMixin], // gives us this.timeAgo()
  props: {
    items: { type: Array, default: () => [] },
  },
  computed: {
    lostCount() {
      return this.items.filter((i) => i.type === 'lost').length;
    },
    foundCount() {
      return this.items.filter((i) => i.type === 'found').length;
    },
    latest() {
      return this.items[0] || null;
    },
  },
};
</script>

<template>
  <section class="stats" aria-label="Summary">
    <div class="stat lost"><strong>{{ lostCount }}</strong><span>looking for their things</span></div>
    <div class="stat found"><strong>{{ foundCount }}</strong><span>found and waiting</span></div>
    <div class="stat latest">
      <template v-if="latest">
        <span>Latest post</span>
        <strong class="text-truncate">{{ latest.title }}</strong>
        <span>{{ timeAgo(latest.created_at) }}</span>
      </template>
      <span v-else>No posts yet</span>
    </div>
  </section>
</template>
