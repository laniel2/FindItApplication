import { ref } from 'vue';
import { api } from '../api/http';

/** CRUD for lost & found items. */
export function useItems() {
  const items = ref([]);
  const loading = ref(false);
  const error = ref('');

  // READ (list)
  async function fetchItems(filters = {}) {
    loading.value = true;
    error.value = '';
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== '' && v != null && v !== false));
      const qs = params.toString();
      items.value = (await api(`/items${qs ? `?${qs}` : ''}`)).items;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  // READ (one)
  const getItem = async (id) => (await api(`/items/${id}`)).item;

  // CREATE
  const createItem = async (payload) => (await api('/items', { method: 'POST', body: payload })).item;

  // UPDATE
  const updateItem = async (id, payload) => (await api(`/items/${id}`, { method: 'PUT', body: payload })).item;

  // UPDATE (open <-> returned)
  async function toggleResolved(item) {
    const updated = (await api(`/items/${item.id}/resolve`, { method: 'PATCH' })).item;
    const i = items.value.findIndex((x) => x.id === item.id);
    if (i > -1) items.value[i] = updated;
    return updated;
  }

  const claimItem = async (id) => (await api(`/items/${id}/claim`, { method: 'PATCH' })).item;

  // DELETE
  async function removeItem(id) {
    await api(`/items/${id}`, { method: 'DELETE' });
    items.value = items.value.filter((x) => x.id !== id);
  }

  return { items, loading, error, fetchItems, getItem, createItem, updateItem, toggleResolved, claimItem, removeItem };
}
