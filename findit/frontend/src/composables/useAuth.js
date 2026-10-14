import { computed } from 'vue';
import { api } from '../api/http';
import { useLocalStorage } from './useLocalStorage';

// Module-level state = one shared login for the whole app.
// It lives in localStorage, so refreshing the page keeps you logged in.
const token = useLocalStorage('findit.token', null);
const user = useLocalStorage('findit.user', null);
const savedAccounts = useLocalStorage('findit.savedAccounts', []);

function rememberAccount(account) {
  if (!account?.email) return;
  savedAccounts.value = [account, ...savedAccounts.value.filter((saved) => saved.id !== account.id)];
}

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value);

  function setSession(data) {
    token.value = data.token;
    user.value = data.user;
    rememberAccount(data.user);
  }

  async function login(credentials) {
    setSession(await api('/auth/login', { method: 'POST', body: credentials }));
  }

  async function register(payload) {
    setSession(await api('/auth/register', { method: 'POST', body: payload }));
  }

  function logout() {
    token.value = null;
    user.value = null;
  }

  async function refresh() {
    if (!token.value) return;
    try {
      user.value = (await api('/auth/me')).user;
      rememberAccount(user.value);
    } catch (err) {
      if (err.status === 401) logout();
    }
  }

  async function updateProfile(payload) {
    user.value = (await api('/users/me', { method: 'PUT', body: payload })).user;
    rememberAccount(user.value);
  }

  return { token, user, savedAccounts, isLoggedIn, login, register, logout, refresh, updateProfile };
}
