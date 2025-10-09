/**
 * @fileoverview Contacts CRM page with import, search, filters
 * @module components/network/ContactsPage
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Search } from 'lucide-react';
import { useContacts } from '@/stores/contacts.store';
import { ImportDialog } from './ImportDialog';
import { ContactDetail } from './ContactDetail';
import type { ContactKind, Relationship } from '@/types/contacts.types';

export function ContactsPage() {
  const { t } = useTranslation();
  const { items } = useContacts();
  const [importOpen, setImportOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<ContactKind | 'all'>('all');
  const [relationFilter, setRelationFilter] = useState<Relationship | 'all'>('all');

  const filtered = items.filter(c => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email||'').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company||'').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKind = kindFilter === 'all' || c.kind === kindFilter;
    const matchesRelation = relationFilter === 'all' || c.relationship === relationFilter;
    return matchesSearch && matchesKind && matchesRelation;
  });

  const selectedContact = items.find(c => c.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('network.contacts')}</h2>
        <div className="flex gap-2">
          <Button onClick={() => setImportOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {t('network.import')}
          </Button>
          <Button onClick={() => setSelectedId('new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('network.newContact')}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('network.searchContacts', 'Search contacts...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="alumni">Alumni</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={relationFilter} onValueChange={(v) => setRelationFilter(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Relations</SelectItem>
            <SelectItem value="weak">Weak</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="strong">Strong</SelectItem>
            <SelectItem value="close">Close</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No contacts found
                </TableCell>
              </TableRow>
            )}
            {filtered.map(c => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedId(c.id)}
              >
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.company}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.kind}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={c.relationship === 'close' ? 'default' : 'secondary'}>
                    {c.relationship}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {c.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {c.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{c.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
