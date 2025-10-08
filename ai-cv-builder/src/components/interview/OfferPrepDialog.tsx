/**
 * Offer Prep Dialog
 * Compensation recommendations and offer letter generation
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Interview } from '@/types/interview.types';
import {
  recommendOffer,
  generateOfferLetter,
  defaultCompBands,
  type CompBand,
} from '@/services/interview/offerPrep.service';
import { FileText, Mail, DollarSign } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview;
}

export default function OfferPrepDialog({ open, onOpenChange, interview }: Props) {
  const { toast } = useToast();
  const [level, setLevel] = useState('Mid-Level');
  const [base, setBase] = useState<number | undefined>();
  const [equityPct, setEquityPct] = useState<number | undefined>();
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [offerLetter, setOfferLetter] = useState('');

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel);
    const recommendation = recommendOffer(newLevel, defaultCompBands);
    if (recommendation.base) {
      setBase(recommendation.base);
      setEquityPct(recommendation.equityPct);
      setCurrency(recommendation.currency);
    }
  };

  const handleGenerateLetter = () => {
    if (!base) {
      toast({
        title: 'Missing information',
        description: 'Please set base compensation',
        variant: 'destructive',
      });
      return;
    }

    const letter = generateOfferLetter({
      candidateName: interview.candidateName,
      role: interview.role,
      company: interview.company,
      base,
      currency,
      equityPct: equityPct ? equityPct / 100 : undefined,
      startDate,
      benefits: ['Health insurance', 'Retirement plan', 'Flexible PTO'],
    });

    setOfferLetter(letter);
  };

  const handleExportPDF = () => {
    toast({
      title: 'Export',
      description: 'PDF export functionality coming soon',
    });
  };

  const handleEmailOffer = () => {
    toast({
      title: 'Email',
      description: 'Email via Step 35 Gmail integration',
    });
  };

  const recommendation = recommendOffer(level, defaultCompBands);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Offer Preparation
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 py-4">
          {/* Left: Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold">Compensation Details</h3>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={level} onValueChange={handleLevelChange}>
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultCompBands.map(band => (
                    <SelectItem key={band.level} value={band.level}>
                      {band.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {recommendation.band && (
              <Card className="p-3 bg-muted/50 text-sm">
                <div className="font-medium mb-2">Recommended Range</div>
                <div className="space-y-1 text-xs">
                  <div>
                    Base: {recommendation.band.currency}{' '}
                    {recommendation.band.baseMin.toLocaleString()} -{' '}
                    {recommendation.band.baseMax.toLocaleString()}
                  </div>
                  {recommendation.band.equityPctMin && (
                    <div>
                      Equity: {(recommendation.band.equityPctMin * 100).toFixed(2)}% -{' '}
                      {(recommendation.band.equityPctMax! * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="base">Base Salary</Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="base"
                  type="number"
                  value={base || ''}
                  onChange={e => setBase(Number(e.target.value))}
                  placeholder="120000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equity">Equity (%)</Label>
              <Input
                id="equity"
                type="number"
                step="0.01"
                value={equityPct || ''}
                onChange={e => setEquityPct(Number(e.target.value))}
                placeholder="0.15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special terms or conditions..."
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleGenerateLetter} className="w-full gap-2">
              <FileText className="w-4 h-4" />
              Generate Offer Letter
            </Button>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold">Offer Letter Preview</h3>

            {offerLetter ? (
              <Card className="p-4 bg-muted/50">
                <pre className="whitespace-pre-wrap text-sm font-sans">{offerLetter}</pre>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Configure details and click "Generate Offer Letter"
                </p>
              </Card>
            )}

            {offerLetter && (
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline" className="flex-1 gap-2">
                  <FileText className="w-4 h-4" />
                  Export PDF
                </Button>
                <Button onClick={handleEmailOffer} variant="outline" className="flex-1 gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
