import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/lib/supabase-types';

export function useProfilesByUserIds(userIds: string[]) {
  return useQuery({
    queryKey: ['profiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (error) throw error;
      
      // Create a map of user_id -> full_name
      const profileMap: Record<string, string> = {};
      data?.forEach((p) => {
        if (p.user_id && p.full_name) {
          profileMap[p.user_id] = p.full_name;
        }
      });
      
      return profileMap;
    },
    enabled: userIds.length > 0,
  });
}
