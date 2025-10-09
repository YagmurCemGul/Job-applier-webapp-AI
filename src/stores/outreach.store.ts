/**
 * @fileoverview Outreach CRM & Sequencer store
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Prospect, ProspectList, Template, Sequence, Campaign, SendLog, TrackingEvent, Referral, SchedulerLink, Suppression, CampaignReportExport
} from '@/types/outreach.types';

interface OutreachState {
  prospects: Prospect[];
  lists: ProspectList[];
  templates: Template[];
  sequences: Sequence[];
  campaigns: Campaign[];
  logs: SendLog[];
  events: TrackingEvent[];
  referrals: Referral[];
  schedulers: SchedulerLink[];
  suppressions: Suppression[];
  exports: CampaignReportExport[];

  upsertProspect: (p: Prospect) => void;
  upsertList: (l: ProspectList) => void;
  upsertTemplate: (t: Template) => void;
  upsertSequence: (s: Sequence) => void;
  upsertCampaign: (c: Campaign) => void;
  upsertLog: (l: SendLog) => void;
  upsertEvent: (e: TrackingEvent) => void;
  upsertReferral: (r: Referral) => void;
  upsertScheduler: (s: SchedulerLink) => void;
  upsertSuppression: (s: Suppression) => void;
  upsertExport: (e: CampaignReportExport) => void;

  isSuppressed: (email?: string) => boolean;
  byList: (listId: string) => Prospect[];
}

export const useOutreach = create<OutreachState>()(
  persist((set, get) => ({
    prospects: [], 
    lists: [], 
    templates: [], 
    sequences: [], 
    campaigns: [], 
    logs: [], 
    events: [], 
    referrals: [], 
    schedulers: [], 
    suppressions: [], 
    exports: [],
    
    upsertProspect: (p)=> set({ prospects: [p, ...get().prospects.filter(x=>x.id!==p.id)] }),
    upsertList: (l)=> set({ lists: [l, ...get().lists.filter(x=>x.id!==l.id)] }),
    upsertTemplate: (t)=> set({ templates: [t, ...get().templates.filter(x=>x.id!==t.id)] }),
    upsertSequence: (s)=> set({ sequences: [s, ...get().sequences.filter(x=>x.id!==s.id)] }),
    upsertCampaign: (c)=> set({ campaigns: [c, ...get().campaigns.filter(x=>x.id!==c.id)] }),
    upsertLog: (l)=> set({ logs: [l, ...get().logs.filter(x=>x.id!==l.id)] }),
    upsertEvent: (e)=> set({ events: [e, ...get().events.filter(x=>x.id!==e.id)] }),
    upsertReferral: (r)=> set({ referrals: [r, ...get().referrals.filter(x=>x.id!==r.id)] }),
    upsertScheduler: (s)=> set({ schedulers: [s, ...get().schedulers.filter(x=>x.id!==s.id)] }),
    upsertSuppression: (s)=> set({ suppressions: [s, ...get().suppressions.filter(x=>x.id!==s.id && x.email!==s.email)] }),
    upsertExport: (e)=> set({ exports: [e, ...get().exports.filter(x=>x.id!==e.id)] }),
    
    isSuppressed: (email)=> !!email && get().suppressions.some(s=> s.email.toLowerCase() === email.toLowerCase()),
    byList: (listId)=> get().prospects.filter(p=> (p.listIds || []).includes(listId))
  }), { 
    name:'outreach', 
    storage: createJSONStorage(()=>localStorage), 
    version:1 
  })
);
