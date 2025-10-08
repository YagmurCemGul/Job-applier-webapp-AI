/**
 * Job Searches Store Unit Tests
 * Step 32 - Tests for saved searches store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useJobSearchesStore } from '@/stores/jobSearches.store';

describe('jobSearches.store', () => {
  beforeEach(() => {
    useJobSearchesStore.setState({ searches: [] });
  });

  describe('upsert', () => {
    it('should create new search', () => {
      const id = useJobSearchesStore.getState().upsert({
        name: 'React Jobs',
        query: 'react developer',
        filters: {},
        alerts: { enabled: true, intervalMin: 60 },
      });
      
      expect(id).toBeDefined();
      expect(useJobSearchesStore.getState().searches).toHaveLength(1);
    });

    it('should update existing search', () => {
      const id = useJobSearchesStore.getState().upsert({
        name: 'React Jobs',
        query: 'react',
        filters: {},
        alerts: { enabled: false, intervalMin: 60 },
      });
      
      useJobSearchesStore.getState().upsert({
        id,
        name: 'React Jobs Updated',
        query: 'react',
        filters: {},
        alerts: { enabled: true, intervalMin: 30 },
      });
      
      expect(useJobSearchesStore.getState().searches).toHaveLength(1);
      expect(useJobSearchesStore.getState().searches[0].name).toBe('React Jobs Updated');
    });
  });

  describe('remove', () => {
    it('should remove search', () => {
      const id = useJobSearchesStore.getState().upsert({
        name: 'Test',
        query: 'test',
        filters: {},
        alerts: { enabled: false, intervalMin: 60 },
      });
      
      useJobSearchesStore.getState().remove(id);
      expect(useJobSearchesStore.getState().searches).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should find search by id', () => {
      const id = useJobSearchesStore.getState().upsert({
        name: 'Test',
        query: 'test',
        filters: {},
        alerts: { enabled: false, intervalMin: 60 },
      });
      
      const found = useJobSearchesStore.getState().getById(id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Test');
    });

    it('should return undefined for non-existent id', () => {
      const found = useJobSearchesStore.getState().getById('nonexistent');
      expect(found).toBeUndefined();
    });
  });
});
