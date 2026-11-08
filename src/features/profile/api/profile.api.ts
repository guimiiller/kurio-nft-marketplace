import { api } from "../../../lib/api/client";

import type {
  CollectorProfile,
  UpdateCollectorProfileInput,
} from "../types/profile.types";

export async function getCollectorProfile(): Promise<CollectorProfile> {
  const { data } = await api.get<CollectorProfile>("/profile");
  return data;
}

export async function updateCollectorProfile(
  input: UpdateCollectorProfileInput,
): Promise<CollectorProfile> {
  const { data } = await api.patch<CollectorProfile>("/profile", input);

  return data;
}
