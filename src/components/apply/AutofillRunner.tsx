/**
 * @fileoverview Autofill Runner component
 * @module components/apply/AutofillRunner
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildPlan } from '@/services/autofill/fieldMapper.service';
import { sendPlanToExtension, onExtensionStatus } from '@/services/autofill/extensionBridge.service';
import { buildClipboardBundle } from '@/services/autofill/clipboardBundle.service';
import { allowAction } from '@/services/autofill/ratelimit.service';
import { useAutofill } from '@/stores/autofill.store';
import { Send, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { FieldMapping } from '@/types/autofill.types';
import type { Screener } from '@/types/apply.types';

interface Props {
  mapping: FieldMapping;
  data: Record<string, string>;
  runId: string;
  screeners: Screener[];
}

export function AutofillRunner({ mapping, data, runId, screeners }: Props) {
  const { t } = useTranslation();
  const { upsertPlan } = useAutofill();
  const [status, setStatus] = useState<'idle' | 'sending' | 'running' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  
  const handleSendToExtension = () => {
    const rateCheck = allowAction('autofill', 5, 60);
    if (!rateCheck.allowed) {
      alert(t('apply.rateLimitExceeded'));
      return;
    }
    
    const plan = buildPlan(mapping, data, runId);
    upsertPlan(plan);
    
    const success = sendPlanToExtension(plan);
    if (success) {
      setStatus('sending');
      
      const unsub = onExtensionStatus((ev) => {
        if (ev.status === 'ok') setStatus('done');
        if (ev.status === 'error') setStatus('error');
      });
      
      // Auto cleanup after 30 seconds
      setTimeout(unsub, 30000);
    }
  };
  
  const handleCopyBundle = () => {
    const bundle = buildClipboardBundle({
      name: data.first_name + ' ' + data.last_name,
      email: data.email,
      phone: data.phone,
      answers: screeners.map(s => ({ q: s.prompt, a: s.answer || '' }))
    });
    
    navigator.clipboard.writeText(bundle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const statusIcons = {
    idle: null,
    sending: <AlertCircle className="h-4 w-4 text-blue-500 animate-pulse" />,
    running: <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />,
    done: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t('apply.autofill')}
          {statusIcons[status]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <strong>{t('apply.ats')}:</strong> {mapping.ats}
          </div>
          <div className="text-sm">
            <strong>{t('apply.fields')}:</strong> {mapping.fields.length}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSendToExtension}
            disabled={status === 'sending' || status === 'running'}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            {t('apply.sendToExtension')}
          </Button>
          
          <Button variant="outline" onClick={handleCopyBundle}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? t('common.copied') : t('apply.copyBundle')}
          </Button>
        </div>
        
        {status === 'error' && (
          <div className="text-sm text-red-600">
            {t('apply.extensionError')}
          </div>
        )}
        
        {status === 'done' && (
          <div className="text-sm text-green-600">
            {t('apply.autofillComplete')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
