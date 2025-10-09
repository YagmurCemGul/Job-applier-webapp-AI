/**
 * @fileoverview CSV import service for prospects
 * Step 48: Networking CRM & Outreach Sequencer
 */

import Papa from 'papaparse';
import { upsertProspect } from './prospect.service';

/** Import prospects from CSV (headers: email,name,role,company,linkedin,cityCountry,tags). */
export async function importProspectsCsv(file: File){
  return await new Promise<number>((resolve, reject)=>{
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        let added = 0;
        for (const row of res.data as any[]) {
          if (!row.email && !row.linkedin) continue;
          upsertProspect({
            email: row.email?.trim() || undefined,
            name: row.name?.trim(),
            role: row.role?.trim(),
            company: row.company?.trim(),
            linkedin: row.linkedin?.trim(),
            cityCountry: row.cityCountry?.trim(),
            tags: row.tags ? String(row.tags).split(',').map((t:string)=>t.trim()) : []
          });
          added++;
        }
        resolve(added);
      },
      error: reject
    });
  });
}
