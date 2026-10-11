import { reactive, ref, watch } from 'vue';

/** Ready-made validation rules. Each returns an error message or ''. */
export const rules = {
  required: (msg = 'This field is required') => (v) => (String(v ?? '').trim() ? '' : msg),
  gmail: () => (v) => (/^[^\s@]+@gmail\.com$/i.test(String(v || '').trim()) ? '' : 'Use your Gmail address (name@gmail.com)'),
  minLength: (n, msg) => (v) => (String(v || '').length >= n ? '' : msg || `Use at least ${n} characters`),
  matches: (field, msg) => (v, all) => (v === all[field] ? '' : msg),
  compose: (...fns) => (v, all) => {
    for (const fn of fns) {
      const message = fn(v, all);
      if (message) return message;
    }
    return '';
  },
};

/**
 * FORM HANDLING composable.
 *  - values:   reactive form data (bind with v-model)
 *  - errors:   message per field
 *  - touched:  which fields the user already visited
 *  - submit(): validates, then runs your async handler and tracks loading + server errors
 */
export function useForm(initialValues, fieldRules = {}) {
  const values = reactive({ ...initialValues });
  const errors = reactive({});
  const touched = reactive({});
  const submitting = ref(false);
  const serverError = ref('');

  function validateField(name) {
    const rule = fieldRules[name];
    errors[name] = rule ? rule(values[name], values) : '';
    return !errors[name];
  }

  function validate() {
    let ok = true;
    for (const name of Object.keys(fieldRules)) {
      touched[name] = true;
      if (!validateField(name)) ok = false;
    }
    return ok;
  }

  function blur(name) {
    touched[name] = true;
    validateField(name);
  }

  const fieldError = (name) => (touched[name] ? errors[name] || '' : '');

  // Re-check visited fields while typing so errors disappear as soon as they're fixed.
  watch(
    () => ({ ...values }),
    () => {
      for (const name of Object.keys(fieldRules)) if (touched[name]) validateField(name);
    }
  );

  async function submit(handler) {
    serverError.value = '';
    if (!validate()) return false;
    submitting.value = true;
    try {
      await handler({ ...values });
      return true;
    } catch (err) {
      serverError.value = err.message;
      if (err.errors) {
        for (const [name, message] of Object.entries(err.errors)) {
          errors[name] = message;
          touched[name] = true;
        }
      }
      return false;
    } finally {
      submitting.value = false;
    }
  }

  function reset(next = initialValues) {
    Object.assign(values, next);
    for (const k of Object.keys(errors)) errors[k] = '';
    for (const k of Object.keys(touched)) touched[k] = false;
    serverError.value = '';
  }

  return { values, errors, touched, submitting, serverError, validateField, validate, blur, fieldError, submit, reset };
}
