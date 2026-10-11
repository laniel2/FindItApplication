<script setup>
import { useFormat } from '../composables/useFormat';

defineProps({
  item: { type: Object, required: true },
  canManage: { type: Boolean, default: false },
});
// CHILD -> PARENT: the card only reports what the user clicked.
const emit = defineEmits(['open', 'edit', 'delete', 'toggle']);
const { formatDate, timeAgo } = useFormat();
</script>

<template>
  <article class="item-card" :class="{ resolved: item.status === 'resolved' }">
    <button type="button" class="item-media" :aria-label="`View ${item.title}`" @click="emit('open', item)">
      <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" />
      <span v-else class="item-noimg"><i class="bi bi-image"></i><small>No photo</small></span>
      <span class="tag-chip" :class="item.type">{{ item.type === 'lost' ? 'Lost' : 'Found' }}</span>
      <span v-if="item.status === 'resolved'" class="returned-flag"><i class="bi bi-check2-circle"></i> Returned</span>
    </button>

    <div class="item-body">
      <h3 class="item-title">
        <a href="#" @click.prevent="emit('open', item)">{{ item.title }}</a>
      </h3>
      <p class="item-meta"><i class="bi bi-geo-alt"></i>{{ item.location }}</p>
      <p class="item-meta"><i class="bi bi-calendar3"></i>{{ formatDate(item.date_event) }}</p>
      <div class="item-foot">
        <span class="item-poster">Posted by {{ item.poster_name }}<br />{{ timeAgo(item.created_at) }}</span>
        <div v-if="canManage" class="item-actions">
          <button type="button" class="icon-btn" :title="item.status === 'open' ? 'Mark as returned' : 'Reopen'" :aria-label="item.status === 'open' ? 'Mark as returned' : 'Reopen'" @click="emit('toggle', item)">
            <i class="bi" :class="item.status === 'open' ? 'bi-check2-circle' : 'bi-arrow-counterclockwise'"></i>
          </button>
          <button type="button" class="icon-btn" title="Edit" aria-label="Edit" @click="emit('edit', item)"><i class="bi bi-pencil"></i></button>
          <button type="button" class="icon-btn danger" title="Delete" aria-label="Delete" @click="emit('delete', item)"><i class="bi bi-trash3"></i></button>
        </div>
      </div>
    </div>
  </article>
</template>
