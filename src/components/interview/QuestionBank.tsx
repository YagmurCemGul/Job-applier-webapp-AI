/**
 * @fileoverview Question bank component for Step 43
 * @module components/interview/QuestionBank
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Database, Sparkles, Search } from 'lucide-react';
import { useQuestionBank } from '@/stores/questionBank.store';
import { seedDefaultQuestions, generateFromJD, filterQuestions } from '@/services/interview/questionBank.service';
import type { InterviewKind, QuestionItem } from '@/types/interview.types';
import { toast } from 'sonner';

interface QuestionBankProps {
  onStartMock?: (questions: QuestionItem[]) => void;
}

export function QuestionBank({ onStartMock }: QuestionBankProps) {
  const { t } = useTranslation();
  const { items, bulk } = useQuestionBank();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{ kind?: InterviewKind; search?: string }>({});
  const [jdText, setJdText] = useState('');
  const [jdRole, setJdRole] = useState('');
  const [generating, setGenerating] = useState(false);

  const filtered = filterQuestions(items, filters);

  const handleSeedDefaults = () => {
    seedDefaultQuestions();
    toast.success(t('interview.defaultsSeeded'));
  };

  const handleGenerateFromJD = async () => {
    if (!jdText || !jdRole) {
      toast.error(t('interview.errors.jdRequired'));
      return;
    }

    setGenerating(true);
    try {
      const questions = await generateFromJD(jdText, jdRole);
      if (questions.length > 0) {
        bulk(questions);
        toast.success(t('interview.questionsGenerated', { count: questions.length }));
        setJdText('');
        setJdRole('');
      } else {
        toast.error(t('interview.errors.noQuestionsGenerated'));
      }
    } catch (error) {
      toast.error(t('interview.errors.generationFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleStartMock = () => {
    const selectedQuestions = items.filter(q => selected.has(q.id));
    if (selectedQuestions.length === 0) {
      toast.error(t('interview.errors.noQuestionsSelected'));
      return;
    }
    onStartMock?.(selectedQuestions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('interview.questionBank')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleSeedDefaults} variant="outline" className="flex-1">
              <Database className="mr-2 h-4 w-4" />
              {t('interview.seedDefaults')}
            </Button>
            <Button onClick={handleStartMock} disabled={selected.size === 0} className="flex-1">
              {t('interview.startMockWithSelected')} ({selected.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('interview.generateFromJD')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t('interview.rolePlaceholder')}
            value={jdRole}
            onChange={e => setJdRole(e.target.value)}
          />
          <textarea
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder={t('interview.jdPlaceholder')}
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          <Button onClick={handleGenerateFromJD} disabled={generating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {generating ? t('interview.generating') : t('interview.generateFromJD')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('interview.questions')} ({filtered.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={filters.kind || 'all'} onValueChange={v => setFilters({ ...filters, kind: v === 'all' ? undefined : v as InterviewKind })}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="system_design">System Design</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('interview.searchQuestions')}
                  className="pl-8 w-64"
                  value={filters.search || ''}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t('interview.prompt')}</TableHead>
                <TableHead>{t('interview.type')}</TableHead>
                <TableHead>{t('interview.difficulty')}</TableHead>
                <TableHead>{t('interview.tags')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(q => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(q.id)}
                      onCheckedChange={checked => {
                        const newSelected = new Set(selected);
                        if (checked) newSelected.add(q.id);
                        else newSelected.delete(q.id);
                        setSelected(newSelected);
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{q.prompt}</TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-1 rounded">{q.kind}</span></TableCell>
                  <TableCell>{'⭐'.repeat(q.difficulty)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{q.tags.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
