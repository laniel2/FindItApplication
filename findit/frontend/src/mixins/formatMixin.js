import { formatDate, timeAgo, initials } from '../utils/format';

// MIXIN (Options API way of sharing logic): its methods are merged into any
// component that lists it in `mixins: [formatMixin]`.
export default {
  methods: {
    formatDate,
    timeAgo,
    initials,
  },
};
