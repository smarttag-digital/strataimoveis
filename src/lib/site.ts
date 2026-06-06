export const SITE = {
  name: "Letícia Souza Negócios Imobiliários",
  shortName: "Letícia Souza Imóveis",
  creci: "CRECI 207663",
  phone: "+55 15 99754-6750",
  whatsapp: "5515997546750",
  email: "contato@leticiasouzaimoveis.com.br",
  city: "Tatuí - SP",
  developer: "Smart Tag",
  
};

export function whatsappLink(message?: string) {
  const text = encodeURIComponent(
    message ??
      "Olá Letícia, encontrei seu site e gostaria de mais informações."
  );
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
}

export function propertyWhatsappLink(propertyTitle: string) {
  return whatsappLink(
    `Olá Letícia, encontrei seu site e gostaria de mais informações do imóvel "${propertyTitle}".`
  );
}

export const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "terreno", label: "Terreno" },
  { value: "condominio", label: "Condomínio" },
  { value: "loteamento", label: "Loteamento" },
  { value: "comercial", label: "Comercial" },
] as const;

export function formatPrice(value: number | null | undefined) {
  if (!value) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
