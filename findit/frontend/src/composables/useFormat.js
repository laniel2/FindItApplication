import { formatDate, timeAgo, initials } from '../utils/format';

// COMPOSABLE (Composition API way of sharing logic): a function you call
// inside setup(). Same helpers as formatMixin, but explicit and tree-shakable.
export function useFormat() {
  return { formatDate, timeAgo, initials };
}
