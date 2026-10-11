// MIXIN: shares data + methods with an Options API component.
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    isEven() {
      return this.count % 2 === 0;
    },
  },
  methods: {
    increment() { this.count++; },
    reset() { this.count = 0; },
  },
};
