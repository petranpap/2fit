import { useEffect, useState } from 'react';

import { fetchPrimaryCategories } from '../api/categories';

// The 4 main categories (Gyms, Martial Arts, Wellness, Personal Trainers) —
// Home's quick-browse row and Explore's "Top Categories" grid both read
// from this, never the full flat category list.
export function usePrimaryCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrimaryCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}
