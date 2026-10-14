<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmModal from '../components/ConfirmModal.vue';
import ItemCard from '../components/ItemCard.vue';
import ItemFilters from '../components/ItemFilters.vue';
import StatsPanel from '../components/StatsPanel.vue'; // an Options API component
import { useAuth } from '../composables/useAuth';
import { useDebounce } from '../composables/useDebounce';
import { useItems } from '../composables/useItems';
import { useLocalStorage } from '../composables/useLocalStorage';
import { useToast } from '../composables/useToast';
import { CATEGORIES, DEFAULT_FILTERS } from '../utils/constants';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { user } = useAuth();
const { items, loading, error, fetchItems, toggleResolved, removeItem } = useItems();

// LOCAL STORAGE: the filters survive a page refresh.
const filters = useLocalStorage('findit.filters', { ...DEFAULT_FILTERS });
filters.value = { ...DEFAULT_FILTERS, ...filters.value };

watch(() => route.query.view, (view, previousView) => {
  if (view === 'my-lost') {
    filters.value = { ...DEFAULT_FILTERS, type: 'lost', status: '', mine: true };
  } else if (view === 'my-returned') {
    filters.value = { ...DEFAULT_FILTERS, status: 'resolved', mine: true };
  } else if (!view && previousView) {
    filters.value = { ...DEFAULT_FILTERS };
  }
}, { immediate: true });

function clearFilters() {
  filters.value = { ...DEFAULT_FILTERS };
  if (route.query.view) router.replace({ name: 'items' });
}

// Wait until the student stops typing before searching.
const debouncedQ = useDebounce(() => filters.value.q, 350);
const query = computed(() => ({
  q: debouncedQ.value.trim(),
  type: filters.value.type,
  category: filters.value.category,
  status: filters.value.status,
}));
watch(query, (q) => fetchItems(q), { immediate: true });

const visible = computed(() => {
  if (!filters.value.mine) return items.value;
  if (route.query.view === 'my-returned') {
    return items.value.filter((i) => i.user_id === user.value.id || i.resolved_by_user_id === user.value.id);
  }
  return items.value.filter((i) => i.user_id === user.value.id);
});
const hasFilters = computed(() => JSON.stringify(filters.value) !== JSON.stringify(DEFAULT_FILTERS));

// DELETE flow: card -> (emit) -> this page -> confirm modal -> (emit) -> this page
const toDelete = ref(null);
const deleting = ref(false);

const openItem = (item) => router.push({ name: 'item-detail', params: { id: item.id } });
const editItem = (item) => router.push({ name: 'item-edit', params: { id: item.id } });

async function onToggle(item) {
  try {
    const updated = await toggleResolved(item);
    await fetchItems(query.value);
    toast.success(updated.status === 'resolved' ? 'Marked as returned' : 'Post reopened');
  } catch (err) {
    toast.error(err.message);
  }
}

async function confirmDelete() {
  deleting.value = true;
  try {
    await removeItem(toDelete.value.id);
    toast.success('Post deleted');
    toDelete.value = null;
  } catch (err) {
    toast.error(err.message);
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Lost &amp; found</h1>
        <p>Search what has been posted, or add something you lost or found.</p>
      </div>
      <router-link :to="{ name: 'item-new' }" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Post an item</router-link>
    </div>

    <StatsPanel :items="visible" />

    <ItemFilters v-model="filters" :categories="CATEGORIES" @reset="clearFilters" />

    <div v-if="error" class="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
      <span>{{ error }}</span>
      <button class="btn btn-sm btn-outline-danger" @click="fetchItems(query)">Try again</button>
    </div>

    <div v-if="loading && !items.length" class="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3" aria-busy="true">
      <div v-for="n in 6" :key="n" class="col"><div class="item-card skeleton"></div></div>
    </div>

    <div v-else-if="visible.length" class="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
      <div v-for="item in visible" :key="item.id" class="col">
        <ItemCard
          :item="item"
          :can-manage="item.user_id === user.id || user.role === 'admin'"
          @open="openItem"
          @edit="editItem"
          @toggle="onToggle"
          @delete="toDelete = $event"
        />
      </div>
    </div>

    <div v-else-if="!loading" class="empty">
      <i class="bi bi-inbox"></i>
      <h2>{{ hasFilters ? 'Nothing matches those filters' : 'No items yet' }}</h2>
      <p>{{ hasFilters ? 'Try a different word, or clear the filters.' : 'Be the first to post something lost or found.' }}</p>
      <button v-if="hasFilters" class="btn btn-light" @click="clearFilters">Clear filters</button>
      <router-link v-else :to="{ name: 'item-new' }" class="btn btn-primary">Post an item</router-link>
    </div>

    <ConfirmModal
      :open="!!toDelete"
      title="Delete this post?"
      :message="toDelete ? `“${toDelete.title}” will be removed for everyone. This cannot be undone.` : ''"
      confirm-text="Delete post"
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>
