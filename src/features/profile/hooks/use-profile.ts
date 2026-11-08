import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "../../auth/hooks/use-auth-session";

import {
  getCollectorProfile,
  updateCollectorProfile,
} from "../api/profile.api";

import type {
  CollectorProfile,
  UpdateCollectorProfileInput,
} from "../types/profile.types";

export const profileQueryKeys = {
  byUser: (userId: string) => ["profile", userId] as const,
};

export function useCollectorProfile() {
  const session = useAuthSession();

  return useQuery({
    queryKey: profileQueryKeys.byUser(session?.userId ?? "guest"),
    queryFn: getCollectorProfile,
    enabled: Boolean(session),
    retry: false,
  });
}

export function useUpdateCollectorProfile() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  return useMutation({
    mutationFn: (input: UpdateCollectorProfileInput) =>
      updateCollectorProfile(input),

    onSuccess: (profile: CollectorProfile) => {
      if (!session) return;

      queryClient.setQueryData(
        profileQueryKeys.byUser(session.userId),
        profile,
      );

      void queryClient.invalidateQueries({
        queryKey: ["auth", "current-user"],
      });
    },
  });
}
