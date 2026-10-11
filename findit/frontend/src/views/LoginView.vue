<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormField from '../components/FormField.vue';
import { useAuth } from '../composables/useAuth';
import { useForm, rules } from '../composables/useForm';
import { useLocalStorage } from '../composables/useLocalStorage';
import { useToast } from '../composables/useToast';

const route = useRoute();
const router = useRouter();
const { login } = useAuth();
const toast = useToast();
const backgroundVideoUrl = '/MaterDei.mp4';

// LOCAL STORAGE: remember the last email so students don't retype it.
const lastEmail = useLocalStorage('findit.lastEmail', '');
const showPassword = ref(false);

const { values, submitting, serverError, blur, fieldError, submit } = useForm(
  { email: lastEmail.value, password: '' },
  {
    email: rules.compose(rules.required('Enter your email'), rules.gmail()),
    password: rules.required('Enter your password'),
  }
);

async function onSubmit() {
  const ok = await submit(async (data) => {
    await login({ email: data.email, password: data.password });
    lastEmail.value = data.email.trim().toLowerCase();
  });
  if (ok) {
    toast.success('Welcome back!');
    const target = route.query.redirect;
    router.push(typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : { name: 'items' });
  }
}
</script>

<template>
  <div class="auth-page">
    <video class="auth-video" autoplay muted loop playsinline :src="backgroundVideoUrl" aria-hidden="true"></video>
    <div class="auth-overlay" aria-hidden="true"></div>

    <aside class="auth-side" aria-hidden="true">
      <div class="auth-brand-stack">
        <div class="auth-brand-row">
          <img class="auth-logo" src="https://staging.materdeicollege.com/wp-content/uploads/2024/04/cropped-MDC-Logo-clipped-1-300x300.png" alt="Mater Dei College logo" />
          <div class="brand light auth-brand"><span class="brand-mark"><i class="bi bi-tag-fill"></i></span><span>FindIt MaterDei</span></div>
        </div>
      </div>
      <p class="auth-tagline">Lost something at school? Someone may have already found it.</p>
    </aside>

    <main class="auth-main">
      <div class="auth-card">
        <div class="brand d-lg-none mb-4"><span class="brand-mark"><i class="bi bi-tag-fill"></i></span><span>FindIt MaterDei</span></div>
        <h1>Log in</h1>
        <p class="auth-sub">Use the Gmail address you registered with.</p>

        <div v-if="serverError" class="alert alert-danger py-2" role="alert">{{ serverError }}</div>

        <form novalidate @submit.prevent="onSubmit">
          <FormField label="Gmail address" input-id="email" :error="fieldError('email')">
            <input id="email" v-model="values.email" type="email" class="form-control" :class="{ 'is-invalid': fieldError('email') }" autocomplete="email" placeholder="name@gmail.com" @blur="blur('email')" />
          </FormField>

          <FormField label="Password" input-id="password" :error="fieldError('password')">
            <div class="input-group">
              <input id="password" v-model="values.password" :type="showPassword ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': fieldError('password') }" autocomplete="current-password" @blur="blur('password')" />
              <button type="button" class="btn btn-light border" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
          </FormField>

          <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>{{ submitting ? 'Logging in…' : 'Log in' }}
          </button>
        </form>

        <p class="auth-switch">New to FindIt MaterDei? <router-link :to="{ name: 'register' }">Create an account</router-link></p>
      </div>
    </main>
  </div>
</template>
