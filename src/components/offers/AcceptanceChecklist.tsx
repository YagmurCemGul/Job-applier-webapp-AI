/**
 * @fileoverview Acceptance checklist component for Step 44
 * @module components/offers/AcceptanceChecklist
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Post-acceptance checklist
 */
export function AcceptanceChecklist() {
  const [checklist, setChecklist] = useState({
    backgroundCheck: false,
    startDate: false,
    equipment: false,
    payroll: false,
    relocation: false,
    benefits: false
  });

  const toggle = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceptance Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="bg"
            checked={checklist.backgroundCheck}
            onCheckedChange={() => toggle('backgroundCheck')}
          />
          <Label htmlFor="bg" className="cursor-pointer">
            Complete background check
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="start"
            checked={checklist.startDate}
            onCheckedChange={() => toggle('startDate')}
          />
          <Label htmlFor="start" className="cursor-pointer">
            Confirm start date
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="equip"
            checked={checklist.equipment}
            onCheckedChange={() => toggle('equipment')}
          />
          <Label htmlFor="equip" className="cursor-pointer">
            Order equipment
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="payroll"
            checked={checklist.payroll}
            onCheckedChange={() => toggle('payroll')}
          />
          <Label htmlFor="payroll" className="cursor-pointer">
            Set up payroll
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reloc"
            checked={checklist.relocation}
            onCheckedChange={() => toggle('relocation')}
          />
          <Label htmlFor="reloc" className="cursor-pointer">
            Arrange relocation (if applicable)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="benefits"
            checked={checklist.benefits}
            onCheckedChange={() => toggle('benefits')}
          />
          <Label htmlFor="benefits" className="cursor-pointer">
            Enroll in benefits
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
