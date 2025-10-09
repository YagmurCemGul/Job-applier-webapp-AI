import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IntroEdge } from '@/types/graph.types';

interface GraphState {
  edges: IntroEdge[];
  upsertEdge: (e: IntroEdge) => void;
  removeEdge: (id: string) => void;
}

export const useGraph = create<GraphState>()(
  persist(
    (set, get) => ({
      edges: [],
      upsertEdge: (e) => set({ edges: [e, ...get().edges.filter(x=>x.id!==e.id)] }),
      removeEdge: (id) => set({ edges: get().edges.filter(x=>x.id!==id) })
    }),
    { name:'intro-graph', storage: createJSONStorage(()=>localStorage), version:1 }
  )
);
