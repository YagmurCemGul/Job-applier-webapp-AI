/**
 * Badge Wall Component (Step 47)
 * Display earned badges and achievements.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/stores/skills.store';
import { Award, Trophy, Star, Gem } from 'lucide-react';

/**
 * Badge Wall displaying achievements by tier.
 */
export function BadgeWall() {
  const { t } = useTranslation();
  const { badges } = useSkills();
  
  const byTier = {
    platinum: badges.filter(b => b.tier === 'platinum'),
    gold: badges.filter(b => b.tier === 'gold'),
    silver: badges.filter(b => b.tier === 'silver'),
    bronze: badges.filter(b => b.tier === 'bronze')
  };

  const tierIcon = {
    platinum: Gem,
    gold: Trophy,
    silver: Star,
    bronze: Award
  };

  const tierColor = {
    platinum: 'text-purple-500',
    gold: 'text-yellow-500',
    silver: 'text-gray-400',
    bronze: 'text-orange-600'
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Wall — {badges.length} Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(byTier).map(([tier, items]) => {
              const Icon = tierIcon[tier as keyof typeof tierIcon];
              const color = tierColor[tier as keyof typeof tierColor];
              return (
                <div key={tier} className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${color}`} />
                  <p className="text-2xl font-bold">{items.length}</p>
                  <p className="text-sm text-muted-foreground capitalize">{tier}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badges by Tier */}
      {Object.entries(byTier).map(([tier, items]) => {
        if (items.length === 0) return null;
        const Icon = tierIcon[tier as keyof typeof tierIcon];
        const color = tierColor[tier as keyof typeof tierColor];
        
        return (
          <Card key={tier}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="capitalize">{tier} Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(badge => (
                  <div 
                    key={badge.id} 
                    className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow"
                  >
                    <Icon className={`h-12 w-12 mx-auto mb-2 ${color}`} />
                    <h4 className="font-medium text-sm mb-1">{badge.title}</h4>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.competencyKey && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {badge.competencyKey}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {badges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No badges yet</h3>
            <p className="text-muted-foreground">
              Complete assessments and improve skills to earn badges.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
