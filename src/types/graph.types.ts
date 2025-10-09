export interface IntroEdge {
  id: string;
  fromId: string;     // introducer
  toId: string;       // target contact
  strength: 1|2|3;    // 3 strong
  reciprocity?: 0|1|2|3;
}

export interface IntroPath {
  path: string[];     // sequence of contact ids
  score: number;      // higher = better
  hops: number;
}
