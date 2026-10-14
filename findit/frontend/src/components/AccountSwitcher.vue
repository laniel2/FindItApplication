<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

const { user, savedAccounts, login } = useAuth();
const router = useRouter();
const toast = useToast();
const open = ref(false);
const selectedEmail = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);
const otherAccounts = computed(() => savedAccounts.value.filter((account) => account.id !== user.value?.id));

watch(open, (isOpen) => {
  if (isOpen) {
    selectedEmail.value = otherAccounts.value[0]?.email || '';
    password.value = '';
    error.value = '';
  }
});

async function onSwitch() {
  if (!selectedEmail.value || !password.value) {
    error.value = 'Choose an account and enter its password.';
    return;
  }
  busy.value = true;
  error.value = '';
  try {
    await login({ email: selectedEmail.value, password: password.value });
    open.value = false;
    password.value = '';
    toast.success('Account switched');
    router.push({ name: 'items' });
  } catch (err) {
    error.value = err.message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <button type="button" class="btn btn-light btn-sm" @click="open = true">
    <i class="bi bi-arrow-left-right"></i><span class="ms-1">Switch account</span>
  </button>

  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="open = false">
      <section class="modal-box" role="dialog" aria-modal="true" aria-labelledby="switch-account-title">
        <h2 id="switch-account-title">Switch account</h2>
        <p>Accounts you have used on this browser are saved here. Enter the account password to switch.</p>

        <div v-if="otherAccounts.length" class="mb-3">
          <label for="saved-account" class="form-label">Saved account</label>
          <select id="saved-account" v-model="selectedEmail" class="form-select">
            <option v-for="account in otherAccounts" :key="account.id" :value="account.email">
              {{ account.name }} ({{ account.email }})
            </option>
          </select>
        </div>
        <div v-else class="alert alert-info py-2">No other saved accounts yet. Log in with another account once to save it here.</div>

        <div v-if="otherAccounts.length" class="mb-3">
          <label for="switch-password" class="form-label">Password</label>
          <input id="switch-password" v-model="password" type="password" class="form-control" autocomplete="current-password" @keyup.enter="onSwitch" />
        </div>
        <div v-if="error" class="alert alert-danger py-2" role="alert">{{ error }}</div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" :disabled="busy" @click="open = false">Cancel</button>
          <button v-if="otherAccounts.length" type="button" class="btn btn-primary" :disabled="busy" @click="onSwitch">
            {{ busy ? 'Switching…' : 'Switch account' }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
