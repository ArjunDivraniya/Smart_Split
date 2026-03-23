import { useCallback, useEffect, useState } from 'react';
import { Group } from '@/src/types/group.types';
import {
  createGroup as createGroupRequest,
  deleteGroup as deleteGroupRequest,
  getGroups,
  type CreateGroupPayload,
} from '@/src/services/groups.service';

interface UseGroupsResult {
  groups: Group[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
  createGroup: (data: CreateGroupPayload) => Promise<Group | null>;
  deleteGroup: (id: string) => Promise<boolean>;
}

const getErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Failed to process group request'
  );
};

export const useGroups = (): UseGroupsResult => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (data: CreateGroupPayload): Promise<Group | null> => {
    try {
      setError(null);
      const createdGroup = await createGroupRequest(data);
      setGroups((prev) => [createdGroup, ...prev.filter((group) => group.id !== createdGroup.id)]);
      return createdGroup;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteGroupRequest(id);
      setGroups((prev) => prev.filter((group) => group.id !== id));
      return true;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return false;
    }
  }, []);

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  return {
    groups,
    loading,
    error,
    refreshGroups,
    createGroup,
    deleteGroup,
  };
};

export default useGroups;
