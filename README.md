# CODE Airsoft App

Base inicial do aplicativo gestor do esporte para o projeto CODE Airsoft.

## Direção adotada

- `Next.js` com `App Router`
- interface `mobile-first`
- mesma base para celular, tablet e PC
- primeira entrega focada em gestão e visualização

## Módulos previstos

- cadastro de praticantes e níveis
- cadastro de árbitros, rangers e operadores desportivos
- cadastro de campos
- squads e ranking
- eventos e treinos
- presença e participação
- pontuação, carência e evolução

## Como rodar

O ambiente atual ainda não possui `Node.js` e `npm` instalados/configurados. Assim que estiverem disponíveis:

```bash
npm install
npm run dev
```

## Estrutura criada nesta fase

- `app/` com dashboard e telas iniciais de `membros`, `squads`, `campos` e `eventos`
- `components/` com shell do painel, tabela e formulario rapido
- `lib/demo-data.ts` com dados simulados para navegarmos no fluxo
- `prisma/schema.prisma` com o desenho inicial do banco PostgreSQL
- `.env.example` com a variavel de conexao esperada

## Próximos passos sugeridos

1. Instalar o ambiente Node no computador.
2. Confirmar as regras de níveis e progressão do esporte.
3. Adicionar banco de dados e autenticação.
4. Transformar os dados de demonstração em cadastros reais.
