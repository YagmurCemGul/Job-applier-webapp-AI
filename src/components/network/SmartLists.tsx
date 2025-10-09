/**
 * @fileoverview Smart lists / saved filters for contacts
 * @module components/network/SmartLists
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, GraduationCap, Star } from 'lucide-react';
import { useContacts } from '@/stores/contacts.store';

export function SmartLists() {
  const { items } = useContacts();

  const lists = [
    {
      icon: Briefcase,
      title: 'Recruiters',
      count: items.filter(c => c.kind === 'recruiter').length,
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Hiring Managers',
      count: items.filter(c => c.kind === 'hiring_manager').length,
      color: 'text-purple-600'
    },
    {
      icon: GraduationCap,
      title: 'Alumni',
      count: items.filter(c => c.kind === 'alumni').length,
      color: 'text-green-600'
    },
    {
      icon: Star,
      title: 'Strong Connections',
      count: items.filter(c => c.relationship === 'strong' || c.relationship === 'close').length,
      color: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {lists.map(list => (
        <Card key={list.title} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{list.title}</CardTitle>
            <list.icon className={`h-4 w-4 ${list.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{list.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
