/**
 * @fileoverview Warm introduction graph visualization with best path finding
 * @module components/network/WarmIntroGraph
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Network, ArrowRight } from 'lucide-react';
import { useContacts } from '@/stores/contacts.store';
import { useGraph } from '@/stores/graph.store';
import { bestIntroPath } from '@/services/graph/graph.service';

export function WarmIntroGraph() {
  const { t } = useTranslation();
  const { items: contacts } = useContacts();
  const { edges } = useGraph();
  const [targetId, setTargetId] = useState('');
  const [path, setPath] = useState<string[] | null>(null);

  const handleFindPath = () => {
    if (!targetId) return;
    const result = bestIntroPath('me', targetId, edges);
    setPath(result?.path || null);
  };

  const getContactName = (id: string) => {
    if (id === 'me') return 'You';
    return contacts.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          {t('network.graph')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target">Find Best Path To</Label>
          <div className="flex gap-2">
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger id="target">
                <SelectValue placeholder="Select contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleFindPath}>{t('network.bestPath')}</Button>
          </div>
        </div>

        {path && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Best Introduction Path:</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {path.map((id, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge variant={i === 0 ? 'default' : 'secondary'}>
                    {getContactName(id)}
                  </Badge>
                  {i < path.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {path.length - 1} hop{path.length - 1 !== 1 ? 's' : ''} to reach target
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Connection Graph</h4>
          <div className="text-sm text-muted-foreground">
            <p>Total connections: {edges.length}</p>
            <p>Contacts in network: {contacts.length}</p>
          </div>
        </div>

        <div role="region" aria-label="Introduction graph alternative">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">From</th>
                <th className="text-left p-2">To</th>
                <th className="text-left p-2">Strength</th>
              </tr>
            </thead>
            <tbody>
              {edges.slice(0, 10).map(e => (
                <tr key={e.id} className="border-b">
                  <td className="p-2">{getContactName(e.fromId)}</td>
                  <td className="p-2">{getContactName(e.toId)}</td>
                  <td className="p-2">
                    <Badge variant={e.strength === 3 ? 'default' : 'secondary'}>
                      {e.strength}/3
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
