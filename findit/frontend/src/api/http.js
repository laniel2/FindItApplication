import { handle } from './localDb';

/**
 * Every part of the app talks to the data through this one function.
 * Right now the data lives in the browser (see localDb.js).
 * Later you could swap this for a real fetch() to a server without
 * touching any composable or page.
 */
export async function api(path, { method = 'GET', body } = {}) {
  return handle(method, path, body);
}
