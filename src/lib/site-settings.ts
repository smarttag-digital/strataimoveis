import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Features = { blog_enabled: boolean };

export type RealtorProfile = {
  name: string;
  creci: string;
  whatsapp: string;
  photo: string;
  bio: string;
  region: string;
};

export type EditorialVideo = {
  url: string;
  title: string;
  description: string;
  property: string;
};

export const defaultRealtorProfile: RealtorProfile = {
  name: "Letícia Souza",
  creci: "CRECI 207663",
  whatsapp: "5515997546750",
  photo: "",
  bio: "Atendimento próximo e criterioso para conectar cada cliente ao imóvel certo, em Tatuí e região.",
  region: "Tatuí e região",
};

export const defaultEditorialVideo: EditorialVideo = {
  url: "",
  title: "Imóveis para viver histórias",
  description: "Conheça de perto espaços, projetos e oportunidades selecionadas.",
  property: "",
};

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

export function useRealtorProfile() {
  return useSetting<RealtorProfile>("realtor_profile", defaultRealtorProfile);
}
