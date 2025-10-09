/**
 * @fileoverview Theme picker with presets and customization.
 * @module components/site/ThemePicker
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Save, AlertCircle } from 'lucide-react';
import { THEME_PRESETS, checkContrast } from '@/services/site/siteBuilder.service';
import type { ThemeId, SiteTheme } from '@/types/site.types';

/**
 * ThemePicker - choose and customize site theme.
 */
export function ThemePicker() {
  const { t } = useTranslation();
  const { site, setTheme } = useSite();
  const [form, setForm] = useState<SiteTheme>(site.theme);

  const handleSave = () => {
    setTheme(form);
  };

  const handlePreset = (id: ThemeId) => {
    setForm(THEME_PRESETS[id]);
  };

  const contrast = checkContrast(form.accent, form.primary);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('site.theme')}</h2>
        <p className="text-muted-foreground">
          Choose a preset or customize colors and fonts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Presets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(THEME_PRESETS).map((preset) => (
            <div
              key={preset.id}
              className={`p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
                form.id === preset.id ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => handlePreset(preset.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <p className="font-medium">{preset.name}</p>
              <p className="text-xs text-muted-foreground">{preset.layout}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customize Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={form.primary}
                  onChange={(e) =>
                    setForm({ ...form, primary: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={form.primary}
                  onChange={(e) =>
                    setForm({ ...form, primary: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  value={form.accent}
                  onChange={(e) =>
                    setForm({ ...form, accent: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={form.accent}
                  onChange={(e) =>
                    setForm({ ...form, accent: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {!contrast.passAA && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Contrast Warning</p>
                <p>
                  Current contrast ratio is {contrast.ratio.toFixed(2)}:1. WCAG
                  AA requires at least 4.5:1 for normal text.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fontHead">Heading Font</Label>
              <Select
                value={form.fontHead}
                onValueChange={(v) => setForm({ ...form, fontHead: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Playfair Display">
                    Playfair Display
                  </SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                  <SelectItem value="Work Sans">Work Sans</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                  <SelectItem value="DM Sans">DM Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fontBody">Body Font</Label>
              <Select
                value={form.fontBody}
                onValueChange={(v) => setForm({ ...form, fontBody: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={form.layout}
              onValueChange={(v) =>
                setForm({ ...form, layout: v as SiteTheme['layout'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Column</SelectItem>
                <SelectItem value="two-column">Two Column</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="darkAuto">Auto Dark Mode</Label>
            <Switch
              id="darkAuto"
              checked={form.darkAuto}
              onCheckedChange={(v) => setForm({ ...form, darkAuto: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: form.primary,
              color: '#ffffff',
              fontFamily: form.fontBody,
            }}
          >
            <h3
              style={{
                fontFamily: form.fontHead,
                fontSize: '24px',
                marginBottom: '12px',
              }}
            >
              Sample Heading
            </h3>
            <p style={{ marginBottom: '12px' }}>
              This is sample body text using your chosen font and colors.
            </p>
            <a
              href="#"
              style={{ color: form.accent, textDecoration: 'underline' }}
            >
              Sample Link
            </a>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Save Theme
      </Button>
    </div>
  );
}