import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBoardMockData } from '../services/boardService';
import { useBoardStore } from '../store/boardStore';

export function useBoardQuery() {
  const { initializeData, tasks } = useBoardStore();

  const query = useQuery({
    queryKey: ['boardMockData'],
    queryFn: fetchBoardMockData,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: tasks.length === 0,
  });

  useEffect(() => {
    if (query.data) {
      initializeData(query.data);
    }
  }, [query.data, initializeData]);

  return query;
}
