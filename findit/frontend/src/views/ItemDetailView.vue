<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmModal from '../components/ConfirmModal.vue';
import { useAuth } from '../composables/useAuth';
import { useFormat } from '../composables/useFormat';
import { useItems } from '../composables/useItems';
import { useToast } from '../composables/useToast';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const toast = useToast();
const { user } = useAuth();
const { formatDate, timeAgo } = useFormat();
const { getItem, toggleResolved, removeItem } = useItems();

const item = ref(null);
const loading = ref(true);
const error = ref('');
const confirming = ref(false);
const busy = ref(false);

const isOwner = computed(() => item.value && item.value.user_id === user.value.id);
const mailto = computed(() => {
  if (!item.value) return '#';
  const subject = encodeURIComponent(`FindIt: ${item.value.title}`);
  const body = encodeURIComponent(`Hi ${item.value.poster_name}, I'm writing about "${item.value.title}" that you posted on FindIt.`);
  return `mailto:${item.value.poster_email}?subject=${subject}&body=${body}`;
});

onMounted(async () => {
  try {
    item.value = await getItem(props.id);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

async function onToggle() {
  try {
    const updated = await toggleResolved(item.value);
    item.value = updated;
    toast.success(updated.status === 'resolved' ? 'Marked as returned' : 'Post reopened');
  } catch (err) {
    toast.error(err.message);
  }
}

async function onDelete() {
  busy.value = true;
  try {
    await removeItem(item.value.id);
    toast.success('Post deleted');
    router.replace({ name: 'items' });
  } catch (err) {
    toast.error(err.message);
    busy.value = false;
    confirming.value = false;
  }
}
</script>

<template>
  <div class="narrow">
    <router-link :to="{ name: 'items' }" class="back-link"><i class="bi bi-arrow-left"></i> All items</router-link>

    <div v-if="loading" class="empty"><div class="spinner-border text-primary" role="status"></div></div>

    <div v-else-if="error" class="empty">
      <i class="bi bi-emoji-frown"></i>
      <h2>{{ error }}</h2>
      <router-link :to="{ name: 'items' }" class="btn btn-primary">Back to all items</router-link>
    </div>

    <article v-else class="panel detail">
      <div class="detail-media">
        <img v-if="item.image" :src="item.image" :alt="item.title" />
        <div v-else class="item-noimg"><i class="bi bi-image"></i><small>No photo</small></div>
        <span class="tag-chip" :class="item.type">{{ item.type === 'lost' ? 'Lost' : 'Found' }}</span>
      </div>

      <div class="detail-info">
        <p v-if="item.status === 'resolved'" class="returned-banner"><i class="bi bi-check2-circle"></i> This item has been returned.</p>
        <h1>{{ item.title }}</h1>
        <dl class="facts">
          <div><dt>Category</dt><dd>{{ item.category }}</dd></div>
          <div><dt>{{ item.type === 'lost' ? 'Last seen at' : 'Found at' }}</dt><dd>{{ item.location }}</dd></div>
          <div><dt>{{ item.type === 'lost' ? 'Lost on' : 'Found on' }}</dt><dd>{{ formatDate(item.date_event) }}</dd></div>
          <div><dt>Posted</dt><dd>{{ timeAgo(item.created_at) }} by {{ item.poster_name }}</dd></div>
        </dl>
        <p v-if="item.description" class="detail-desc">{{ item.description }}</p>

        <div class="detail-actions">
          <template v-if="isOwner">
            <router-link :to="{ name: 'item-edit', params: { id: item.id } }" class="btn btn-primary"><i class="bi bi-pencil me-1"></i>Edit</router-link>
            <button class="btn btn-light" @click="onToggle">
              <i class="bi me-1" :class="item.status === 'open' ? 'bi-check2-circle' : 'bi-arrow-counterclockwise'"></i>
              {{ item.status === 'open' ? 'Mark as returned' : 'Reopen post' }}
            </button>
            <button class="btn btn-outline-danger" @click="confirming = true"><i class="bi bi-trash3 me-1"></i>Delete</button>
          </template>
          <a v-else :href="mailto" class="btn btn-primary">
            <i class="bi bi-envelope me-1"></i>{{ item.type === 'lost' ? 'I found this' : 'This is mine' }}
          </a>
        </div>
        <p v-if="!isOwner" class="field-hint mt-2">This opens an email to {{ item.poster_name }} ({{ item.poster_email }}).</p>
      </div>
    </article>

    <ConfirmModal
      :open="confirming"
      title="Delete this post?"
      message="It will be removed for everyone. This cannot be undone."
      confirm-text="Delete post"
      :busy="busy"
      @confirm="onDelete"
      @cancel="confirming = false"
    />
  </div>
</template>
