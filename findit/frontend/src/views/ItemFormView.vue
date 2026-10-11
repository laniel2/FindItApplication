<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import FormField from '../components/FormField.vue';
import ImageDropzone from '../components/ImageDropzone.vue';
import { useAuth } from '../composables/useAuth';
import { useForm, rules } from '../composables/useForm';
import { useItems } from '../composables/useItems';
import { useLocalStorage } from '../composables/useLocalStorage';
import { useToast } from '../composables/useToast';
import { CATEGORIES } from '../utils/constants';
import { todayISO } from '../utils/format';

// This one page does both CREATE (/items/new) and UPDATE (/items/:id/edit).
const props = defineProps({ id: { type: String, default: null } }); // from the route param
const router = useRouter();
const toast = useToast();
const { user } = useAuth();
const { getItem, createItem, updateItem } = useItems();

const isEdit = computed(() => !!props.id);
const today = todayISO();
const blank = { type: 'lost', title: '', category: '', location: '', date_event: today, description: '', image: '' };

const { values, submitting, serverError, errors, blur, fieldError, submit, reset } = useForm(
  { ...blank },
  {
    title: rules.required('Give the item a short title'),
    category: rules.required('Pick a category'),
    location: rules.required('Tell us where it was lost or found'),
    date_event: rules.required('Choose a date'),
  }
);

// LOCAL STORAGE: an unfinished "new item" is kept as a draft.
const draft = useLocalStorage('findit.draft', null);
const draftRestored = ref(false);
const loading = ref(false);
const done = ref(false);

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const item = await getItem(props.id);
      if (item.user_id !== user.value.id) {
        toast.error('You can only edit your own posts');
        return router.replace({ name: 'items' });
      }
      reset({
        type: item.type, title: item.title, category: item.category, location: item.location,
        date_event: item.date_event, description: item.description || '', image: item.image || '',
      });
    } catch (err) {
      toast.error(err.message);
      router.replace({ name: 'items' });
    } finally {
      loading.value = false;
    }
  } else if (draft.value) {
    reset({ ...blank, ...draft.value });
    draftRestored.value = true;
  }
});

watch(values, (v) => {
  if (isEdit.value || done.value) return;
  const started = v.title || v.location || v.description || v.image || v.category;
  draft.value = started ? { ...v } : null;
});

function discardDraft() {
  draft.value = null;
  reset({ ...blank });
  draftRestored.value = false;
}

async function onSubmit() {
  const ok = await submit(async (data) => {
    const saved = isEdit.value ? await updateItem(props.id, data) : await createItem(data);
    done.value = true;
    draft.value = null;
    toast.success(isEdit.value ? 'Changes saved' : 'Item posted');
    router.push({ name: 'item-detail', params: { id: saved.id } });
  });
  if (!ok && Object.keys(errors).some((k) => errors[k])) window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <div class="narrow">
    <router-link :to="isEdit ? { name: 'item-detail', params: { id } } : { name: 'items' }" class="back-link"><i class="bi bi-arrow-left"></i> Back</router-link>
    <div class="page-head">
      <div>
        <h1>{{ isEdit ? 'Edit your post' : 'Post an item' }}</h1>
        <p>A clear photo and exact place help the owner recognise it.</p>
      </div>
    </div>

    <div v-if="loading" class="empty"><div class="spinner-border text-primary" role="status"></div></div>

    <form v-else class="panel" novalidate @submit.prevent="onSubmit">
      <div v-if="draftRestored" class="alert alert-info d-flex justify-content-between align-items-center py-2">
        <span>We restored your unfinished post.</span>
        <button type="button" class="btn btn-link btn-sm p-0" @click="discardDraft">Start over</button>
      </div>
      <div v-if="serverError" class="alert alert-danger py-2" role="alert">{{ serverError }}</div>

      <div class="type-pick" role="radiogroup" aria-label="Did you lose it or find it?">
        <label :class="{ on: values.type === 'lost' }" class="lost">
          <input v-model="values.type" type="radio" value="lost" />
          <i class="bi bi-search"></i><strong>I lost something</strong><span>I'm looking for it</span>
        </label>
        <label :class="{ on: values.type === 'found' }" class="found">
          <input v-model="values.type" type="radio" value="found" />
          <i class="bi bi-hand-thumbs-up"></i><strong>I found something</strong><span>I'm holding it</span>
        </label>
      </div>

      <FormField label="Photo" input-id="photo" hint="Optional, but items with a photo are returned faster.">
        <ImageDropzone v-model="values.image" label="Drop a photo of the item here" />
      </FormField>

      <FormField label="Item name" input-id="title" :error="fieldError('title')">
        <input id="title" v-model="values.title" class="form-control" :class="{ 'is-invalid': fieldError('title') }" maxlength="120" placeholder="e.g. Blue water bottle" @blur="blur('title')" />
      </FormField>

      <div class="row">
        <div class="col-md-6">
          <FormField label="Category" input-id="category" :error="fieldError('category')">
            <select id="category" v-model="values.category" class="form-select" :class="{ 'is-invalid': fieldError('category') }" @blur="blur('category')">
              <option value="" disabled>Choose one</option>
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </FormField>
        </div>
        <div class="col-md-6">
          <FormField :label="values.type === 'lost' ? 'Date it was lost' : 'Date it was found'" input-id="date" :error="fieldError('date_event')">
            <input id="date" v-model="values.date_event" type="date" :max="today" class="form-control" :class="{ 'is-invalid': fieldError('date_event') }" @blur="blur('date_event')" />
          </FormField>
        </div>
      </div>

      <FormField :label="values.type === 'lost' ? 'Where did you last see it?' : 'Where did you find it?'" input-id="location" :error="fieldError('location')">
        <input id="location" v-model="values.location" class="form-control" :class="{ 'is-invalid': fieldError('location') }" placeholder="e.g. Library, second floor" @blur="blur('location')" />
      </FormField>

      <FormField label="Details" input-id="description" hint="Colour, brand, marks, or where the item can be picked up.">
        <textarea id="description" v-model="values.description" rows="4" class="form-control" maxlength="1000"></textarea>
      </FormField>

      <div class="d-flex gap-2 justify-content-end">
        <router-link :to="isEdit ? { name: 'item-detail', params: { id } } : { name: 'items' }" class="btn btn-light">Cancel</router-link>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>{{ isEdit ? 'Save changes' : 'Post item' }}
        </button>
      </div>
    </form>
  </div>
</template>
