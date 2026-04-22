/**
 * Loading Skeleton Components
 */

"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CardSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="h-8 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 bg-slate-200 rounded-lg w-5/6 animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function StatsSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse mb-2" />
                <div className="h-8 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2 border-0">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="h-12 w-12 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
          </div>
          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ cols = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
      {[...Array(cols)].map((_, i) => (
        <Card key={i} className="border-0 shadow-xl overflow-hidden">
          <div className="h-32 bg-slate-200 animate-pulse" />
          <CardContent className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default {
  CardSkeleton,
  StatsSkeletons,
  TableSkeleton,
  GridSkeleton,
};
