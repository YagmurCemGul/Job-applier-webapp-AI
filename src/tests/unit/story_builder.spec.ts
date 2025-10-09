/**
 * @fileoverview Unit tests for STAR story builder service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildStarDraft, saveStory, formatAsbullets } from '@/services/interview/storyBuilder.service';
import { useInterview } from '@/stores/interview.store';

describe('StoryBuilder Service', () => {
  beforeEach(() => {
    useInterview.setState({ plans: [], runs: [], stories: [], followups: [] });
  });

  describe('buildStarDraft', () => {
    it('should create STAR draft with title', () => {
      const story = buildStarDraft('Test Story');
      expect(story.title).toBe('Test Story');
      expect(story.S).toBeTruthy();
      expect(story.T).toBeTruthy();
      expect(story.A).toBeTruthy();
      expect(story.R).toBeTruthy();
    });

    it('should include default tags', () => {
      const story = buildStarDraft('Test');
      expect(story.tags).toContain('impact');
      expect(story.tags).toContain('ownership');
    });

    it('should generate unique ID', () => {
      const story1 = buildStarDraft('Test 1');
      const story2 = buildStarDraft('Test 2');
      expect(story1.id).not.toBe(story2.id);
    });

    it('should include metrics array', () => {
      const story = buildStarDraft('Test');
      expect(Array.isArray(story.metrics)).toBe(true);
      expect(story.metrics!.length).toBeGreaterThan(0);
    });

    it('should include links array', () => {
      const story = buildStarDraft('Test');
      expect(Array.isArray(story.links)).toBe(true);
    });
  });

  describe('saveStory', () => {
    it('should persist story to store', () => {
      const story = buildStarDraft('Test');
      saveStory(story);
      
      const { stories } = useInterview.getState();
      expect(stories).toHaveLength(1);
      expect(stories[0].id).toBe(story.id);
    });

    it('should return saved story', () => {
      const story = buildStarDraft('Test');
      const saved = saveStory(story);
      expect(saved).toEqual(story);
    });

    it('should update existing story', () => {
      const story = buildStarDraft('Test');
      saveStory(story);
      
      const updated = { ...story, title: 'Updated' };
      saveStory(updated);
      
      const { stories } = useInterview.getState();
      expect(stories).toHaveLength(1);
      expect(stories[0].title).toBe('Updated');
    });
  });

  describe('formatAsbullets', () => {
    it('should format STAR as markdown bullets', () => {
      const story = buildStarDraft('Test Story');
      const bullets = formatAsbullets(story);
      
      expect(bullets).toContain('**Test Story**');
      expect(bullets).toContain('**Situation:**');
      expect(bullets).toContain('**Task:**');
      expect(bullets).toContain('**Action:**');
      expect(bullets).toContain('**Result:**');
    });

    it('should include metrics if present', () => {
      const story = buildStarDraft('Test');
      story.metrics = ['+50% growth'];
      const bullets = formatAsbullets(story);
      
      expect(bullets).toContain('**Metrics:**');
      expect(bullets).toContain('+50% growth');
    });

    it('should include links if present', () => {
      const story = buildStarDraft('Test');
      story.links = ['https://example.com'];
      const bullets = formatAsbullets(story);
      
      expect(bullets).toContain('**Links:**');
      expect(bullets).toContain('https://example.com');
    });
  });
});
