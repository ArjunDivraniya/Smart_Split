import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPartialSettlement,
  getPendingSettlements,
  markAsReceived,
  ReminderResponse,
  sendReminder,
} from '@/src/services/settlements.service';
import {
  Settlement,
  SettlementStatus,
  SettlementSummary,
} from '@/src/types/settlement.types';

const getErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Failed to process settlement request'
  );
};

interface UseSettlementsResult {
  summary: SettlementSummary | null;
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
  activeFilter: SettlementStatus | 'all';
  activeView: 'combined' | 'bygroup';
  activeDirection: 'all' | 'you_owe' | 'they_owe';
  filteredSettlements: Settlement[];
  overdueSettlements: Settlement[];
  groupedByGroup: Record<string, Settlement[]>;
  hasOverdue: boolean;
  isAllSettled: boolean;
  setActiveFilter: (value: SettlementStatus | 'all') => void;
  setActiveView: (value: 'combined' | 'bygroup') => void;
  setActiveDirection: (value: 'all' | 'you_owe' | 'they_owe') => void;
  fetchSettlements: () => Promise<void>;
  settlePartial: (id: string, data: { amountPaid: number; method: string; note?: string }) => Promise<Settlement | null>;
  remindFriend: (id: string) => Promise<ReminderResponse | null>;
  markReceived: (id: string) => Promise<Settlement | null>;
}

export const useSettlements = (): UseSettlementsResult => {
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SettlementStatus | 'all'>('all');
  const [activeView, setActiveView] = useState<'combined' | 'bygroup'>('combined');
  const [activeDirection, setActiveDirection] = useState<'all' | 'you_owe' | 'they_owe'>('all');

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPendingSettlements();
      setSummary(data?.summary || null);
      setSettlements(Array.isArray(data?.settlements) ? data.settlements : []);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setSummary(null);
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const filteredSettlements = useMemo(() => {
    if (activeFilter === 'all' && activeDirection === 'all') {
      return settlements;
    }

    return settlements.filter((settlement) => {
      const statusMatch = activeFilter === 'all' || settlement.status === activeFilter;
      const directionMatch = activeDirection === 'all' || settlement.direction === activeDirection;
      return statusMatch && directionMatch;
    });
  }, [settlements, activeFilter, activeDirection]);

  const overdueSettlements = useMemo(() => {
    return settlements.filter((settlement) => settlement.status === 'overdue');
  }, [settlements]);

  const groupedByGroup = useMemo(() => {
    return filteredSettlements.reduce<Record<string, Settlement[]>>((acc, settlement) => {
      const groupKey = settlement.group?.id || 'direct';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(settlement);
      return acc;
    }, {});
  }, [filteredSettlements]);

  const hasOverdue = overdueSettlements.length > 0;

  const isAllSettled = useMemo(() => {
    return settlements.length === 0 || filteredSettlements.every((s) => s.status === 'completed');
  }, [settlements.length, filteredSettlements]);

  const settlePartial = useCallback(
    async (id: string, data: { amountPaid: number; method: string; note?: string }): Promise<Settlement | null> => {
      try {
        setError(null);
        const updated = await createPartialSettlement(id, data);
        await fetchSettlements();
        return updated;
      } catch (err: any) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [fetchSettlements]
  );

  const remindFriend = useCallback(async (id: string): Promise<ReminderResponse | null> => {
    try {
      setError(null);
      const response = await sendReminder(id);
      return response;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const markReceived = useCallback(
    async (id: string): Promise<Settlement | null> => {
      try {
        setError(null);
        const updated = await markAsReceived(id);
        await fetchSettlements();
        return updated;
      } catch (err: any) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [fetchSettlements]
  );

  return {
    summary,
    settlements,
    loading,
    error,
    activeFilter,
    activeView,
    activeDirection,
    filteredSettlements,
    overdueSettlements,
    groupedByGroup,
    hasOverdue,
    isAllSettled,
    setActiveFilter,
    setActiveView,
    setActiveDirection,
    fetchSettlements,
    settlePartial,
    remindFriend,
    markReceived,
  };
};

export default useSettlements;
