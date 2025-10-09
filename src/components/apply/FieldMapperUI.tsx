/**
 * @fileoverview Field Mapper UI component
 * @module components/apply/FieldMapperUI
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAutofill } from '@/stores/autofill.store';
import { DEFAULT_MAPPINGS } from '@/services/autofill/mappingCatalog.service';
import { Building } from 'lucide-react';
import type { FieldMapping } from '@/types/autofill.types';

interface Props {
  onSelect: (mapping: FieldMapping) => void;
}

export function FieldMapperUI({ onSelect }: Props) {
  const { t } = useTranslation();
  const { mappings, upsertMapping } = useAutofill();
  
  // Ensure default mappings are available
  DEFAULT_MAPPINGS.forEach(m => {
    if (!mappings.find(existing => existing.id === m.id)) {
      upsertMapping(m);
    }
  });
  
  const allMappings = [...DEFAULT_MAPPINGS, ...mappings].filter(
    (m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx
  );
  
  const [selected, setSelected] = useState<string>(allMappings[0]?.id || '');
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelected(id);
    const mapping = allMappings.find(m => m.id === id);
    if (mapping) onSelect(mapping);
  };
  
  const currentMapping = allMappings.find(m => m.id === selected);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('apply.mapping')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ats-select">{t('apply.selectATS')}</Label>
          <Select id="ats-select" value={selected} onChange={handleChange}>
            {allMappings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ats} ({m.fields.length} fields)
              </option>
            ))}
          </Select>
        </div>
        
        {currentMapping && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              {currentMapping.ats}
            </div>
            <div className="flex flex-wrap gap-1">
              {currentMapping.fields.map((f) => (
                <Badge key={f.name} variant="outline">
                  {f.name} ({f.type})
                  {f.required && <span className="ml-1 text-red-500">*</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
