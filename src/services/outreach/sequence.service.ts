/**
 * @fileoverview Sequence builder service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { Sequence, SeqStep } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

/** Create a basic 3-step sequence with safe defaults. */
export function createSafeSequence(name: string, baseHtml: string){
  const steps: SeqStep[] = [
    { 
      id: crypto.randomUUID(), 
      kind:'email', 
      subject:'{{subject}}', 
      html: baseHtml, 
      channel:'gmail', 
      stopOnReply:true, 
      stopOnUnsub:true 
    },
    { 
      id: crypto.randomUUID(), 
      kind:'wait', 
      waitDays: 3 
    },
    { 
      id: crypto.randomUUID(), 
      kind:'email', 
      subject:'Following up on {{subject}}', 
      html:'<p>Just following up on the note below — any thoughts?</p>{{threadSnippet}}', 
      channel:'gmail', 
      stopOnReply:true, 
      stopOnUnsub:true 
    }
  ];
  
  const seq: Sequence = { 
    id: crypto.randomUUID(), 
    name, 
    steps, 
    rules: { 
      throttlePerHour: 30, 
      dailyCap: 150, 
      quietHours: true 
    }, 
    ab:{ 
      enabled:false, 
      goal:'reply_rate', 
      variants:{ A:{}, B:{} } 
    } 
  };
  
  useOutreach.getState().upsertSequence(seq);
  return seq;
}
