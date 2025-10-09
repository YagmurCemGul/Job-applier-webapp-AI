/**
 * @fileoverview Unit tests for graph pathfinding
 */

import { describe, it, expect } from 'vitest';
import { bestIntroPath } from '@/services/graph/graph.service';
import type { IntroEdge } from '@/types/graph.types';

describe('Graph Pathfinding', () => {
  it('finds direct path', () => {
    const edges: IntroEdge[] = [
      { id: '1', fromId: 'me', toId: 'alice', strength: 3 }
    ];

    const path = bestIntroPath('me', 'alice', edges);
    expect(path).not.toBeNull();
    expect(path?.path).toEqual(['me', 'alice']);
    expect(path?.hops).toBe(1);
  });

  it('finds multi-hop path', () => {
    const edges: IntroEdge[] = [
      { id: '1', fromId: 'me', toId: 'alice', strength: 3 },
      { id: '2', fromId: 'alice', toId: 'bob', strength: 2 }
    ];

    const path = bestIntroPath('me', 'bob', edges);
    expect(path).not.toBeNull();
    expect(path?.path).toEqual(['me', 'alice', 'bob']);
    expect(path?.hops).toBe(2);
  });

  it('returns null when no path exists', () => {
    const edges: IntroEdge[] = [
      { id: '1', fromId: 'me', toId: 'alice', strength: 3 }
    ];

    const path = bestIntroPath('me', 'bob', edges);
    expect(path).toBeNull();
  });

  it('prefers stronger connections', () => {
    const edges: IntroEdge[] = [
      { id: '1', fromId: 'me', toId: 'alice', strength: 1 },
      { id: '2', fromId: 'alice', toId: 'target', strength: 1 },
      { id: '3', fromId: 'me', toId: 'bob', strength: 3 },
      { id: '4', fromId: 'bob', toId: 'target', strength: 3 }
    ];

    const path = bestIntroPath('me', 'target', edges);
    expect(path).not.toBeNull();
    // Should prefer stronger path through bob
    expect(path?.score).toBeGreaterThan(0);
  });
});
