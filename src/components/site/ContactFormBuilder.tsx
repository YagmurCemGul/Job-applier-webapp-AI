/**
 * @fileoverview Contact form builder with spam protection.
 * @module components/site/ContactFormBuilder
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactForm } from '@/types/site.types';

/**
 * ContactFormBuilder - build and configure contact forms.
 */
export function ContactFormBuilder() {
  const { t } = useTranslation();
  const { site, setContact } = useSite();
  const [form, setForm] = useState<ContactForm>(
    site.contact || {
      id: crypto.randomUUID(),
      title: 'Contact Me',
      fields: [
        { id: 'name', label: 'Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      captchaHoneypot: true,
      timeGateSec: 3,
      sendToEmail: '',
      successMessage: 'Thank you! I will get back to you soon.',
    }
  );

  const handleSave = () => {
    if (!form.sendToEmail) {
      toast.error('Missing email — please set a delivery email');
      return;
    }
    setContact(form);
    toast.success('Contact form saved');
  };

  const addField = () => {
    setForm({
      ...form,
      fields: [
        ...form.fields,
        {
          id: crypto.randomUUID(),
          label: '',
          type: 'text',
          required: false,
        },
      ],
    });
  };

  const removeField = (idx: number) => {
    setForm({
      ...form,
      fields: form.fields.filter((_, i) => i !== idx),
    });
  };

  const updateField = (
    idx: number,
    key: string,
    value: string | boolean
  ) => {
    setForm({
      ...form,
      fields: form.fields.map((f, i) =>
        i === idx ? { ...f, [key]: value } : f
      ),
    });
  };

  const handleTest = () => {
    toast.info('Test submission — in production, this would send via Gmail');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('site.contact')}</h2>
        <p className="text-muted-foreground">
          Build a contact form with spam protection
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="sendTo">Delivery Email (Gmail)</Label>
            <Input
              id="sendTo"
              type="email"
              value={form.sendToEmail}
              onChange={(e) =>
                setForm({ ...form, sendToEmail: e.target.value })
              }
              placeholder="your@gmail.com"
            />
          </div>

          <div>
            <Label htmlFor="success">Success Message</Label>
            <Textarea
              id="success"
              value={form.successMessage}
              onChange={(e) =>
                setForm({ ...form, successMessage: e.target.value })
              }
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex gap-2 items-end p-3 border rounded-md"
            >
              <div className="flex-1">
                <Label>Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) =>
                    updateField(idx, 'label', e.target.value)
                  }
                />
              </div>
              <div className="w-32">
                <Label>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(v) => updateField(idx, 'type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(v) => updateField(idx, 'required', v)}
                />
                <Label className="text-xs">Required</Label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeField(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spam Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="honeypot">Honeypot Field</Label>
              <p className="text-sm text-muted-foreground">
                Hidden field to catch bots
              </p>
            </div>
            <Switch
              id="honeypot"
              checked={form.captchaHoneypot}
              onCheckedChange={(v) =>
                setForm({ ...form, captchaHoneypot: v })
              }
            />
          </div>

          <div>
            <Label htmlFor="timeGate">Time Gate (seconds)</Label>
            <Input
              id="timeGate"
              type="number"
              value={form.timeGateSec}
              onChange={(e) =>
                setForm({ ...form, timeGateSec: Number(e.target.value) })
              }
              min={0}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum time before submit button is enabled
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Form
        </Button>
        <Button variant="outline" onClick={handleTest}>
          <Mail className="h-4 w-4 mr-2" />
          {t('site.sendTest')}
        </Button>
      </div>
    </div>
  );
}