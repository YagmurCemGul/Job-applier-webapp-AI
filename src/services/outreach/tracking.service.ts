/**
 * @fileoverview Email tracking service
 * Step 48: Networking CRM & Outreach Sequencer
 */

import type { TrackingEvent, MetricKey } from '@/types/outreach.types';
import { useOutreach } from '@/stores/outreach.store';

/** Add tracking event and update rollup metrics. */
export function track(logId: string, type: TrackingEvent['type']){
  const ev: TrackingEvent = { 
    id: crypto.randomUUID(), 
    logId, 
    type, 
    at: new Date().toISOString() 
  };
  
  useOutreach.getState().upsertEvent(ev);
  
  const log = useOutreach.getState().logs.find(l=>l.id===logId);
  if (!log) return ev;
  
  const camp = useOutreach.getState().campaigns.find(c=>c.id===log.campaignId);
  if (!camp) return ev;
  
  const bump = (m: MetricKey) => camp.metrics[m] = (camp.metrics[m] || 0) + 1;
  
  if (type==='open') { 
    log.opens = (log.opens||0)+1; 
    bump('opens'); 
  }
  if (type==='click') { 
    log.clicks = (log.clicks||0)+1; 
    bump('clicks'); 
  }
  if (type==='reply') { 
    log.replied = true; 
    bump('replies'); 
  }
  if (type==='bounce') { 
    log.status = 'bounced'; 
    bump('bounces'); 
  }
  if (type==='unsub') { 
    bump('unsubs'); 
  }
  
  useOutreach.getState().upsertLog({ ...log });
  useOutreach.getState().upsertCampaign({ ...camp });
  
  return ev;
}
