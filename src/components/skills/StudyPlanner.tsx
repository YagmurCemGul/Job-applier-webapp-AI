/**
 * Study Planner Component (Step 47)
 * Spaced repetition flashcard review with SM-2.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/stores/skills.store';
import { dueCards, reviewCard } from '@/services/skills/spacedRep.service';
import { Brain, RotateCcw } from 'lucide-react';
import type { Flashcard } from '@/types/skills.types';

/**
 * Study Planner with SM-2 spaced repetition.
 */
export function StudyPlanner() {
  const { t } = useTranslation();
  const { cards } = useSkills();
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const due = dueCards();

  const handleStart = () => {
    if (due.length > 0) {
      setCurrentCard(due[0]);
      setShowBack(false);
    }
  };

  const handleReview = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!currentCard) return;
    reviewCard(currentCard.id, quality);
    
    if (quality >= 3) setStreak(s => s + 1);
    else setStreak(0);
    
    const remaining = dueCards();
    if (remaining.length > 0) {
      setCurrentCard(remaining[0]);
      setShowBack(false);
    } else {
      setCurrentCard(null);
    }
  };

  if (currentCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Review Card</span>
            <div className="flex gap-2">
              <Badge variant="outline">{due.length} remaining</Badge>
              <Badge variant="secondary">🔥 {streak} streak</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Card Front */}
          <div className="min-h-[200px] flex items-center justify-center p-8 border-2 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">{currentCard.front}</p>
              {showBack && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-muted-foreground">{currentCard.back}</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          {!showBack ? (
            <Button onClick={() => setShowBack(true)} className="w-full">
              Show Answer
            </Button>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2 text-center">
                How well did you remember? (0 = forgot, 5 = perfect)
              </p>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map(q => (
                  <Button
                    key={q}
                    variant={q >= 3 ? 'default' : 'outline'}
                    onClick={() => handleReview(q as 0 | 1 | 2 | 3 | 4 | 5)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Competency: {currentCard.competencyKey}</p>
            <p>Interval: {currentCard.interval} days • Reps: {currentCard.reps} • EF: {currentCard.ef.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Study Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">{due.length}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">{cards.length}</p>
              <p className="text-sm text-muted-foreground">Total Cards</p>
            </div>
          </div>

          {due.length > 0 ? (
            <Button onClick={handleStart} className="w-full gap-2">
              <Brain className="h-4 w-4" />
              Start Review Session
            </Button>
          ) : (
            <div className="text-center py-8">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground">
                No cards due for review. Check back later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming */}
      {cards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Cards ({cards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cards.slice(0, 5).map(card => (
                <div key={card.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{card.front}</p>
                    <p className="text-xs text-muted-foreground">{card.competencyKey}</p>
                  </div>
                  <Badge variant={new Date(card.dueISO) <= new Date() ? 'default' : 'outline'}>
                    {new Date(card.dueISO).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
