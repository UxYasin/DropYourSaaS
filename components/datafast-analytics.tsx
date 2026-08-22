'use client';

import { useEffect } from 'react';
import { getDataFast } from '@/lib/analytics';

export function DataFastAnalytics() {
  useEffect(() => {
    getDataFast();
  }, []);

  return null;
}
