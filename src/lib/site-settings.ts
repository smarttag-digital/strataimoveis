import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Features = { blog_enabled: boolean };

export function useFeatures() {
  return useQuery({
    queryKey: ["site-settings", "features"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "features")
        .maybeSingle();
      return ((data?.value as Features) ?? { blog_enabled: true }) as Features;
    },
  });
}

export function useSetting<T = any>(key: string, fallback: T) {
  return useQuery({
    queryKey: ["site-settings", key],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      return ((data?.value as T) ?? fallback) as T;
    },
  });
}
