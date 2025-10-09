/**
 * @fileoverview Resources Vault component (Step 45)
 * @module components/onboarding/ResourcesVault
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, Search } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  tags: string[];
}

interface Props {
  resources?: Resource[];
  onAdd?: (r: Resource) => void;
}

/**
 * Resources Vault - links and files for onboarding
 */
export function ResourcesVault({ resources = [], onAdd }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState({ title: '', url: '', tags: '' });
  
  const handleAdd = () => {
    if (!editing.title.trim() || !onAdd) return;
    
    onAdd({
      id: crypto.randomUUID(),
      title: editing.title,
      url: editing.url,
      tags: editing.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    
    setEditing({ title: '', url: '', tags: '' });
  };
  
  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('onboard.resources')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="pl-10"
            />
          </div>
          
          {/* Resources list */}
          <div className="space-y-2">
            {filtered.map(resource => (
              <div key={resource.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{resource.title}</h4>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      {resource.url} <ExternalLink className="h-3 w-3" />
                    </a>
                    {resource.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {resource.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No resources found
              </p>
            )}
          </div>
          
          {/* Add resource */}
          {onAdd && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Resource title..."
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editing.tags}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                  placeholder="handbook, security, runbooks"
                />
              </div>
              <Button onClick={handleAdd} size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
