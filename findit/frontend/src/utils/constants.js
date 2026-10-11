export const CATEGORIES = [
  'Bags', 'Books & notes', 'Electronics', 'ID & cards',
  'Keys', 'Clothing', 'Water bottles', 'Other',
];

export const DEFAULT_FILTERS = {
  q: '',
  type: '',        // '' = lost + found
  category: '',
  status: 'open',  // 'open' | 'resolved' | '' (all)
  mine: false,
};
