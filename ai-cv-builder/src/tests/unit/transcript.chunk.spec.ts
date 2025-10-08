/**
 * Unit Tests: Transcript Chunking
 * Tests segment appending, ordering, and search functionality
 */

import { describe, it, expect } from 'vitest';
import { makeTranscript } from '@/services/interview/transcription.service';
import type { Transcript } from '@/types/transcript.types';

describe('Transcript Chunking', () => {
  it('should create transcript with ordered segments', () => {
    const segments: Transcript['segments'] = [
      { id: '1', atMs: 0, durMs: 1000, speaker: 'Interviewer', text: 'Hello' },
      { id: '2', atMs: 2000, durMs: 1000, speaker: 'Candidate', text: 'Hi' },
      { id: '3', atMs: 4000, durMs: 1000, speaker: 'Interviewer', text: 'How are you?' },
    ];

    const transcript = makeTranscript('int-1', 'en', segments);

    expect(transcript.segments).toHaveLength(3);
    expect(transcript.segments[0].atMs).toBe(0);
    expect(transcript.segments[1].atMs).toBe(2000);
    expect(transcript.segments[2].atMs).toBe(4000);
  });

  it('should handle segments appended in order', () => {
    const segments: Transcript['segments'] = [];

    // Simulate real-time appending
    segments.push({ id: '1', atMs: 0, durMs: 1000, speaker: 'Interviewer', text: 'First' });
    segments.push({ id: '2', atMs: 1500, durMs: 1000, speaker: 'Candidate', text: 'Second' });
    segments.push({
      id: '3',
      atMs: 3000,
      durMs: 1000,
      speaker: 'Interviewer',
      text: 'Third',
    });

    const transcript = makeTranscript('int-1', 'en', segments);

    expect(transcript.segments).toHaveLength(3);
    expect(transcript.segments.map(s => s.text)).toEqual(['First', 'Second', 'Third']);
  });

  it('should support search/filtering', () => {
    const segments: Transcript['segments'] = [
      {
        id: '1',
        atMs: 0,
        durMs: 1000,
        speaker: 'Interviewer',
        text: 'Tell me about your experience with React',
      },
      {
        id: '2',
        atMs: 2000,
        durMs: 1000,
        speaker: 'Candidate',
        text: 'I have 5 years of React experience',
      },
      {
        id: '3',
        atMs: 4000,
        durMs: 1000,
        speaker: 'Interviewer',
        text: 'What about TypeScript?',
      },
      {
        id: '4',
        atMs: 6000,
        durMs: 1000,
        speaker: 'Candidate',
        text: 'Yes, I use TypeScript daily',
      },
    ];

    const transcript = makeTranscript('int-1', 'en', segments);

    // Search for "React"
    const reactMatches = transcript.segments.filter(s =>
      s.text.toLowerCase().includes('react')
    );
    expect(reactMatches).toHaveLength(2);

    // Search for "TypeScript"
    const tsMatches = transcript.segments.filter(s =>
      s.text.toLowerCase().includes('typescript')
    );
    expect(tsMatches).toHaveLength(2);

    // Search for non-existent term
    const noMatches = transcript.segments.filter(s => s.text.toLowerCase().includes('python'));
    expect(noMatches).toHaveLength(0);
  });

  it('should preserve speaker information', () => {
    const segments: Transcript['segments'] = [
      { id: '1', atMs: 0, durMs: 1000, speaker: 'Interviewer', text: 'Question' },
      { id: '2', atMs: 2000, durMs: 1000, speaker: 'Candidate', text: 'Answer' },
      { id: '3', atMs: 4000, durMs: 1000, speaker: 'System', text: 'Recording paused' },
    ];

    const transcript = makeTranscript('int-1', 'en', segments);

    expect(transcript.segments[0].speaker).toBe('Interviewer');
    expect(transcript.segments[1].speaker).toBe('Candidate');
    expect(transcript.segments[2].speaker).toBe('System');
  });

  it('should handle empty segments', () => {
    const transcript = makeTranscript('int-1', 'en', []);

    expect(transcript.segments).toHaveLength(0);
    expect(transcript.interviewId).toBe('int-1');
    expect(transcript.language).toBe('en');
  });

  it('should support multilingual transcripts', () => {
    const segmentsEN: Transcript['segments'] = [
      { id: '1', atMs: 0, durMs: 1000, speaker: 'Interviewer', text: 'Hello' },
    ];

    const segmentsTR: Transcript['segments'] = [
      { id: '1', atMs: 0, durMs: 1000, speaker: 'Interviewer', text: 'Merhaba' },
    ];

    const transcriptEN = makeTranscript('int-1', 'en', segmentsEN);
    const transcriptTR = makeTranscript('int-2', 'tr', segmentsTR);

    expect(transcriptEN.language).toBe('en');
    expect(transcriptTR.language).toBe('tr');
  });
});
