<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import FormField from '../components/FormField.vue';
import { useAuth } from '../composables/useAuth';
import { useForm, rules } from '../composables/useForm';
import { useToast } from '../composables/useToast';

const router = useRouter();
const { register } = useAuth();
const toast = useToast();
const showPassword = ref(false);

const { values, submitting, serverError, blur, fieldError, submit } = useForm(
  { name: '', student_id: '', email: '', password: '', confirm: '' },
  {
    name: rules.required('Enter your full name'),
    student_id: rules.required('Enter your student ID'),
    email: rules.compose(rules.required('Enter your email'), rules.gmail()),
    password: rules.minLength(6, 'Use at least 6 characters'),
    confirm: rules.matches('password', 'Passwords do not match'),
  }
);

async function onSubmit() {
  const ok = await submit(({ confirm, ...payload }) => register(payload));
  if (ok) {
    toast.success('Account created. Add a profile photo next!');
    router.push({ name: 'profile' });
  }
}
</script>

<template>
  <div class="auth-page">
    <aside class="auth-side" aria-hidden="true">
      <div class="brand light"><span class="brand-mark"><i class="bi bi-tag-fill"></i></span><span>FindIt</span></div>
      <div class="tag-art">
        <span class="tag-hole"></span>
        <span class="tag-chip lost">Lost</span>
        <h2>Black calculator</h2>
        <p><i class="bi bi-geo-alt"></i>Room 204, before lunch</p>
        <p><i class="bi bi-person"></i>Name written inside the cover</p>
      </div>
      <p class="auth-tagline">Post what you lost or found. Students and staff will see it right away.</p>
    </aside>

    <main class="auth-main">
      <div class="auth-card">
        <div class="brand d-lg-none mb-4"><span class="brand-mark"><i class="bi bi-tag-fill"></i></span><span>FindIt</span></div>
        <h1>Create your account</h1>
        <p class="auth-sub">It takes less than a minute.</p>

        <div v-if="serverError" class="alert alert-danger py-2" role="alert">{{ serverError }}</div>

        <form novalidate @submit.prevent="onSubmit">
          <FormField label="Full name" input-id="name" :error="fieldError('name')">
            <input id="name" v-model="values.name" class="form-control" :class="{ 'is-invalid': fieldError('name') }" autocomplete="name" @blur="blur('name')" />
          </FormField>

          <FormField label="Student ID" input-id="student_id" :error="fieldError('student_id')">
            <input id="student_id" v-model="values.student_id" class="form-control" :class="{ 'is-invalid': fieldError('student_id') }" @blur="blur('student_id')" />
          </FormField>

          <FormField label="Gmail address" input-id="email" :error="fieldError('email')">
            <input id="email" v-model="values.email" type="email" class="form-control" :class="{ 'is-invalid': fieldError('email') }" autocomplete="email" placeholder="name@gmail.com" @blur="blur('email')" />
          </FormField>

          <div class="row">
            <div class="col-sm-6">
              <FormField label="Password" input-id="password" :error="fieldError('password')">
                <input id="password" v-model="values.password" :type="showPassword ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': fieldError('password') }" autocomplete="new-password" @blur="blur('password')" />
              </FormField>
            </div>
            <div class="col-sm-6">
              <FormField label="Confirm password" input-id="confirm" :error="fieldError('confirm')">
                <input id="confirm" v-model="values.confirm" :type="showPassword ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': fieldError('confirm') }" autocomplete="new-password" @blur="blur('confirm')" />
              </FormField>
            </div>
          </div>

          <div class="form-check mb-3">
            <input id="showpw" v-model="showPassword" type="checkbox" class="form-check-input" />
            <label class="form-check-label" for="showpw">Show passwords</label>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>{{ submitting ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="auth-switch">Already have an account? <router-link :to="{ name: 'login' }">Log in</router-link></p>
      </div>
    </main>
  </div>
</template>
