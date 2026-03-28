import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/src/services/api';

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  upiId: string;
  avatar: string;
  monthlyIncome: number;
  savingsGoal: number;
  preferences: any;
  createdAt: string;
}

export interface ProfileStats {
  totalGroups: number;
  totalPersonalExpenses: number;
  totalSpent: number;
  thisMonthSpent: number;
  totalSettled: number;
  totalGroupsCreated: number;
  memberSince: string;
}

export interface FullProfile {
  user: ProfileUser;
  stats: ProfileStats;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.profile.getProfile();
      const data = response.data;

      if (data && data.user && data.stats) {
        setProfile({
          user: data.user,
          stats: data.stats,
        });
      } else {
        setError('Invalid profile data');
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Failed to fetch profile';
      setError(errorMsg);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};

export default useProfile;
