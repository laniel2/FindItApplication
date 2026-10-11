<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmModal from '../components/ConfirmModal.vue';
import FormField from '../components/FormField.vue';
import ImageDropzone from '../components/ImageDropzone.vue';
import ItemCard from '../components/ItemCard.vue';
import { useAuth } from '../composables/useAuth';
import { useForm, rules } from '../composables/useForm';
import { useItems } from '../composables/useItems';
import { useToast } from '../composables/useToast';

const router = useRouter();
const toast = useToast();
const { user, updateProfile } = useAuth();
const { items, loading, fetchItems, toggleResolved, removeItem } = useItems();

const { values, submitting, serverError, blur, fieldError, submit } = useForm(
  {
    name: user.value.name,
    student_id: user.value.student_id,
    course: user.value.course || '',
    year_level: user.value.year_level || '',
    avatar: user.value.avatar || '',
  },
  {
    name: rules.required('Enter your full name'),
    student_id: rules.required('Enter your student ID'),
  }
);

onMounted(() => fetchItems({ user_id: user.value.id }));

async function onSubmit() {
  const ok = await submit((data) => updateProfile(data));
  if (ok) toast.success('Profile saved');
}

const toDelete = ref(null);
const deleting = ref(false);

async function onToggle(item) {
  try {
    const updated = await toggleResolved(item);
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
        <h1>My profile</h1>
        <p>Your photo and name show up on every post you make.</p>
      </div>
    </div>

    <form class="row g-4 mb-5" novalidate @submit.prevent="onSubmit">
      <div class="col-lg-4">
        <div class="panel text-center">
          <ImageDropzone v-model="values.avatar" shape="circle" :max-size="320" label="Profile photo" hint="Drop a photo or click" />
          <p class="field-hint mt-3 mb-0">Square photos work best. We crop it to a circle.</p>
          <p class="mt-3 mb-0 small text-muted">{{ user.email }}</p>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="panel">
          <div v-if="serverError" class="alert alert-danger py-2" role="alert">{{ serverError }}</div>
          <div class="row">
            <div class="col-md-6">
              <FormField label="Full name" input-id="p-name" :error="fieldError('name')">
                <input id="p-name" v-model="values.name" class="form-control" :class="{ 'is-invalid': fieldError('name') }" @blur="blur('name')" />
              </FormField>
            </div>
            <div class="col-md-6">
              <FormField label="Student ID" input-id="p-sid" :error="fieldError('student_id')">
                <input id="p-sid" v-model="values.student_id" class="form-control" :class="{ 'is-invalid': fieldError('student_id') }" @blur="blur('student_id')" />
              </FormField>
            </div>
            <div class="col-md-6">
              <FormField label="Course or strand" input-id="p-course">
                <input id="p-course" v-model="values.course" class="form-control" placeholder="e.g. BSIT" />
              </FormField>
            </div>
            <div class="col-md-6">
              <FormField label="Year or grade level" input-id="p-year">
                <input id="p-year" v-model="values.year_level" class="form-control" placeholder="e.g. 3rd year" />
              </FormField>
            </div>
          </div>
          <div class="text-end">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>Save profile
            </button>
          </div>
        </div>
      </div>
    </form>

    <div class="page-head">
      <div>
        <h2 class="h3 mb-1">My posts</h2>
        <p>Edit, mark as returned, or delete what you posted.</p>
      </div>
    </div>

    <div v-if="loading" class="empty"><div class="spinner-border text-primary" role="status"></div></div>
    <div v-else-if="items.length" class="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
      <div v-for="item in items" :key="item.id" class="col">
        <ItemCard
          :item="item"
          can-manage
          @open="router.push({ name: 'item-detail', params: { id: $event.id } })"
          @edit="router.push({ name: 'item-edit', params: { id: $event.id } })"
          @toggle="onToggle"
          @delete="toDelete = $event"
        />
      </div>
    </div>
    <div v-else class="empty">
      <i class="bi bi-inbox"></i>
      <h2>You haven't posted anything yet</h2>
      <router-link :to="{ name: 'item-new' }" class="btn btn-primary">Post an item</router-link>
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
