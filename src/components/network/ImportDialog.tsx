/**
 * @fileoverview Import contacts from CSV/VCF/LinkedIn exports
 * @module components/network/ImportDialog
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useContacts } from '@/stores/contacts.store';
import { parseCSV, parseVCF } from '@/services/contacts/importers.service';
import { parseLinkedInExport } from '@/services/integrations/linkedin.stub.service';
import { dedupeByEmail } from '@/services/contacts/dedupe.service';
import { inferKind } from '@/services/contacts/enrichment.service';
import type { Contact } from '@/types/contacts.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { items, upsert } = useContacts();
  const [format, setFormat] = useState<'csv' | 'vcf' | 'linkedin'>('csv');
  const [preview, setPreview] = useState<Contact[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    let parsed: Contact[] = [];

    try {
      if (format === 'csv') {
        parsed = parseCSV(text);
      } else if (format === 'vcf') {
        parsed = parseVCF(text);
      } else if (format === 'linkedin') {
        const li = parseLinkedInExport(text);
        parsed = li.map(x => ({
          id: crypto.randomUUID(),
          name: x.name,
          email: x.email,
          company: x.company,
          title: x.title,
          tags: ['linkedin-import'],
          kind: inferKind(x.title),
          relationship: 'weak',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Contact));
      }
      setPreview(parsed.slice(0, 10)); // Show first 10
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  const handleImport = () => {
    setImporting(true);
    const deduped = dedupeByEmail(items, preview);
    const newContacts = deduped.slice(items.length);
    newContacts.forEach(c => upsert(c));
    setImporting(false);
    onOpenChange(false);
    setPreview([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('network.import')}</DialogTitle>
          <DialogDescription>
            Import contacts from CSV, vCard (VCF), or LinkedIn export files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="format">Import Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (name,email,company,title,city,tags)</SelectItem>
                <SelectItem value="vcf">vCard (VCF)</SelectItem>
                <SelectItem value="linkedin">LinkedIn Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <div className="flex items-center gap-2">
              <input
                id="file"
                type="file"
                accept={format === 'vcf' ? '.vcf' : '.csv'}
                onChange={handleFileUpload}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 10 contacts)</Label>
              <div className="rounded-md border p-4 max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((c, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2">{c.name}</td>
                        <td className="p-2">{c.email}</td>
                        <td className="p-2">{c.company}</td>
                        <td className="p-2">{c.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground">
                Total: {preview.length} contacts will be imported (duplicates by email will be merged)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || importing}>
            {importing ? 'Importing...' : `Import ${preview.length} Contacts`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
