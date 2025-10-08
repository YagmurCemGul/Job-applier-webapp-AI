/**
 * Question Bank Dialog
 * Browse and insert interview questions by category
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuestionBank, type Question } from '@/stores/questionBank.store';
import { Plus, Trash2, Copy, FileQuestion } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert?: (question: string) => void;
}

export default function QuestionBankDialog({ open, onOpenChange, onInsert }: Props) {
  const { items, upsert, remove, byTag } = useQuestionBank();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [newQuestion, setNewQuestion] = useState('');
  const [newTag, setNewTag] = useState('behavioral');
  const [newLang, setNewLang] = useState<'en' | 'tr'>('en');

  const tags = ['all', 'behavioral', 'technical', 'system-design', 'leadership', 'culture'];
  const filtered = selectedTag === 'all' ? items : byTag(selectedTag);

  const handleAdd = () => {
    if (!newQuestion.trim()) return;

    const question: Question = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      text: newQuestion.trim(),
      tag: newTag,
      lang: newLang,
    };

    upsert(question);
    setNewQuestion('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    if (onInsert) {
      onInsert(text);
    }
  };

  const predefinedQuestions: Question[] = [
    {
      id: 'preset-1',
      text: 'Tell me about a time when you faced a significant technical challenge. How did you approach it?',
      tag: 'behavioral',
      lang: 'en',
    },
    {
      id: 'preset-2',
      text: 'Describe your experience with system design. Walk me through a system you designed.',
      tag: 'system-design',
      lang: 'en',
    },
    {
      id: 'preset-3',
      text: 'How do you handle disagreements with teammates or stakeholders?',
      tag: 'behavioral',
      lang: 'en',
    },
    {
      id: 'preset-4',
      text: 'What is your approach to debugging a complex production issue?',
      tag: 'technical',
      lang: 'en',
    },
    {
      id: 'preset-5',
      text: 'Tell me about a time you had to make a trade-off between code quality and shipping quickly.',
      tag: 'leadership',
      lang: 'en',
    },
    {
      id: 'preset-6',
      text: 'Bir ekip arkadaşınızla görüş ayrılığına düştüğünüz bir durumu anlatın.',
      tag: 'behavioral',
      lang: 'tr',
    },
  ];

  // Add preset questions to items if not already there
  const allQuestions = [...filtered, ...predefinedQuestions.filter(pq => !items.find(i => i.id === pq.id))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5" />
            Question Bank
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New Question */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Add New Question</h3>
            <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTag} onValueChange={setNewTag}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="system-design">System Design</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={newLang} onValueChange={(v: any) => setNewLang(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tr">Turkish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  className="flex-1"
                />
                <Button onClick={handleAdd} disabled={!newQuestion.trim()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className="capitalize"
              >
                {tag === 'all' ? 'All' : tag.replace(/-/g, ' ')}
              </Button>
            ))}
          </div>

          {/* Questions List */}
          <div className="space-y-2">
            {allQuestions.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No questions in this category</p>
              </Card>
            ) : (
              allQuestions.map(q => (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {q.tag?.replace(/-/g, ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs uppercase">
                          {q.lang}
                        </Badge>
                      </div>
                      <p className="text-sm">{q.text}</p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(q.text)}
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {!q.id.startsWith('preset-') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(q.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
