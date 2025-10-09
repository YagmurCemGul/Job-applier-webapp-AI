/**
 * @fileoverview Pipeline item side panel with actions
 * @module components/network/PipelineSidePanel
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { usePipeline } from '@/stores/pipeline.store';
import { useContacts } from '@/stores/contacts.store';
import { score } from '@/services/pipeline/recruiterPipeline.service';
import type { PipelineStage } from '@/stores/pipeline.store';

interface Props {
  itemId: string;
  onClose: () => void;
}

export function PipelineSidePanel({ itemId, onClose }: Props) {
  const { items, upsert, setStage } = usePipeline();
  const { getById } = useContacts();
  const item = items.find(i => i.id === itemId);
  const [notes, setNotes] = useState(item?.notes || '');

  useEffect(() => {
    setNotes(item?.notes || '');
  }, [item]);

  if (!item) return null;

  const contact = getById(item.contactId);
  const currentScore = score(item);

  const handleStageChange = (stage: PipelineStage) => {
    setStage(item.id, stage);
  };

  const handleSaveNotes = () => {
    upsert({ ...item, notes });
  };

  return (
    <Card className="w-96 flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Pipeline Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium">{contact?.name || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">{item.company}</div>
          <div className="text-sm text-muted-foreground">{item.role}</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Stage</label>
          <Select value={item.stage} onValueChange={handleStageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="intro_requested">Intro Requested</SelectItem>
              <SelectItem value="referred">Referred</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="in_process">In Process</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Score</div>
          <Badge variant="default">{(currentScore * 100).toFixed(0)}%</Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Based on stage and recency
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Add notes about this opportunity..."
          />
          <Button size="sm" onClick={handleSaveNotes}>Save Notes</Button>
        </div>

        <div className="border-t pt-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            Schedule Follow-up
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Send Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
