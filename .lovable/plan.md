## Plano de implementação

Vou entregar em uma rodada o conjunto de melhorias mais impactantes do briefing, priorizando o front-end público e a base do CRUD admin. Funcionalidades muito pesadas (editor de blog completo, gestão de banners, dashboard analítico) ficam para a próxima iteração.

### 1. Banco de dados (migração Supabase)
- Adicionar em `properties`: `reference` (text, único, gerado automaticamente — ex.: `LS0001`), `transaction_type` já existe (venda/aluguel) — manter.
- Trigger `before insert` para gerar `reference` sequencial e `slug` único a partir do título quando não fornecido.
- Índices em `reference`, `slug`, `city`, `neighborhood`, `price`.
- Atualizar `site_settings` com chave `social_links` (tiktok, instagram, whatsapp, youtube, facebook).

### 2. Front-end público
- **Barra de filtros moderna** (estilo do print enviado): componente `SearchBar` com 2 linhas de dropdowns (Tipo de Negócio, Tipo de Imóvel, Valor mín/máx, Cidade, Bairro, Condomínios) + botão Pesquisar + link "Buscar por referência". Usada no Hero da Home e no topo de `/imoveis`.
- **Home**: Hero com a nova SearchBar, seção "Últimos imóveis cadastrados" (6 mais recentes), seção "Destaques" (flag `is_featured`), CTAs.
- **Rota `/imovel/$ref`**: aceita referência OU slug, redireciona para a página de detalhes correta.
- **Footer com redes sociais**: ícones TikTok, WhatsApp, Instagram, YouTube, Facebook puxados de `site_settings.social_links`. Barra fixa mobile-first com os mesmos ícones.
- **SEO dinâmico**: `head()` por rota em `/imoveis/$slug` com title, description, og:title, og:description, og:image (cover).

### 3. Admin – CRUD de Imóveis
- `/admin/imoveis`: listagem com busca, filtros por status/destaque, paginação simples.
- `/admin/imoveis/novo` e `/admin/imoveis/$id/editar`: formulário completo (todos os campos), upload múltiplo de imagens (galeria) + capa + vídeos (URLs) + PDF/plantas, toggle destaque/lançamento/oportunidade/MCMV/publicado.
- Upload integrado ao bucket `property-media` já existente, organizado em `properties/{id}/`.
- `/admin/configuracoes`: editar contato, CRECI, e redes sociais (gravando em `site_settings`).

### 4. Captação de leads
- Bloco de formulário "Tenho interesse" já existe na página de imóvel — garantir vínculo com `property_interest` preenchido com referência + título.

### Detalhes técnicos
- TanStack Start + Supabase JS client no browser; uploads via `supabase.storage`.
- Componentes UI: shadcn `Select`, `Popover`, `Command` para os dropdowns de cidade/bairro com busca.
- Slug/referência gerados no banco para garantir unicidade independente do client.

### Fora deste escopo (próxima iteração)
- Editor rico de blog, gestão visual de banners, dashboard de métricas, realtime de imóveis, sitemap.xml dinâmico, OG image automática para compartilhamento.

Confirma para eu seguir? Posso também já começar pelos itens 1+2 (front público + banco) e deixar o CRUD admin completo para a próxima rodada — me diga qual prefere.
