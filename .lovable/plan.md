# Integração total Painel ↔ Portal

Objetivo: tornar o portal 100% administrável, com atualização em tempo real e sem necessidade de republicar.

## 1. Sincronização em tempo real (Realtime)

Habilitar **Supabase Realtime** nas tabelas `properties`, `developments`, `site_settings`, `blog_posts` e usar **React Query** com invalidação automática.

- Migração: `ALTER PUBLICATION supabase_realtime ADD TABLE …` para as 4 tabelas.
- Criar hook `useRealtimeSync(table, queryKeys[])` em `src/hooks/use-realtime-sync.ts` que escuta `postgres_changes` e chama `queryClient.invalidateQueries`.
- Plugar o hook em `__root.tsx` para invalidar globalmente quando qualquer registro mudar (cache stale-while-revalidate com `staleTime: 0` nas queries públicas).
- Resultado: criar/editar imóvel ou alterar configurações aparece no site sem refresh.

## 2. Módulo Empreendimentos (CRUD completo no Admin)

A tabela `developments` já existe. Adicionar campos: `builder`, `neighborhood`, `address`, `construction_status`, `delivery_date`, `price_from`, `price_to`, `units_count`, `virtual_tour_url`, `latitude`, `longitude`, `is_featured`, `slug` (com trigger igual ao de properties).

Arquivos novos:
- `src/components/admin/DevelopmentForm.tsx` (espelha PropertyForm)
- `src/routes/admin.empreendimentos.tsx` (listagem)
- `src/routes/admin.empreendimentos.novo.tsx`
- `src/routes/admin.empreendimentos.$id.editar.tsx`

Site público: atualizar `src/routes/empreendimentos.tsx` para listar dinamicamente + criar `src/routes/empreendimento.$slug.tsx` com detalhes, galeria, vídeo, tour, mapa.

## 3. Imóveis — ampliar campos e ações

Migração para adicionar à `properties`: `condo_fee`, `iptu`, `suites`, `total_area`, `state` (default 'SP'), `latitude`, `longitude`, `virtual_tour_url`, `agent_id`, `status` (`disponivel|reservado|vendido|inativo`), `archived` (bool).

Atualizar `PropertyForm.tsx` com os campos novos + ações na listagem admin:
- **Duplicar** (insert clonando campos, sem id/reference/slug — trigger gera novos)
- **Arquivar** (toggle `archived`)
- **Excluir** (já existe via PropertyForm)
- Filtro de status na listagem.

Public read policy passa a exigir `archived = false`.

## 4. Corretores (suporte para "corretor responsável")

Nova tabela `agents` (nome, foto, creci, telefone, email, bio, ativo) + CRUD admin em `src/routes/admin.corretores.tsx`. Imóveis referenciam via `agent_id`. Exibir card do corretor na página de detalhes do imóvel.

## 5. Controle do Blog (toggle no Admin)

- `site_settings` ganha chave `features` = `{ blog_enabled: boolean }`.
- `admin.configuracoes.tsx`: adicionar toggle "Exibir Blog no site".
- `Header.tsx` e `Footer.tsx` leem a config (via query realtime) e escondem o link quando desativado.
- Rota `/blog` redireciona para `/` quando desativado.

## 6. Configurações dinâmicas (tudo via banco)

Garantir que `site_settings` controle:
- Textos institucionais (sobre, hero, CTAs)
- Banners (URLs de imagem da home)
- Contato, CRECI, redes sociais (já existe)
- Toggle blog (item 5)

Editor unificado em `admin.configuracoes.tsx` por abas (Contato · Home · Sobre · Redes · Recursos).
Componentes públicos (`index.tsx`, `sobre.tsx`, `Footer.tsx`, `Header.tsx`) passam a ler tudo de `site_settings` com realtime.

## 7. Detalhes técnicos

- Storage `property-media` reaproveitado para empreendimentos e corretores (prefixos `developments/`, `agents/`).
- Todas as queries públicas usam `useQuery` com `queryKey` estável e `useRealtimeSync` para auto-refresh.
- Sem necessidade de republicar: Supabase é a fonte da verdade; o frontend reage a eventos em tempo real.

## Fora do escopo nesta rodada
- Editor rich-text de blog (já planejado; será iteração separada).
- Importação em massa de imóveis (CSV/XML).
- Dashboard com métricas.

Confirma para eu executar tudo isso em sequência? (migração + componentes + integração realtime)
