# Arquitetura inicial

## Estratégia

Adotamos uma base web responsiva para acelerar a entrega e permitir uso em:

- celular no campo
- tablet para arbitragem ou coordenação
- desktop para gestão administrativa

## Núcleos do sistema

### 1. Identidade e acesso

- autenticação
- perfis e permissões
- vínculo do usuário com função esportiva

### 2. Estrutura esportiva

- campos
- squads
- operadores desportivos
- árbitros
- rangers
- praticantes

### 3. Operação

- eventos
- treinos
- check-in
- presença
- participação por squad

### 4. Evolução

- pontuação individual
- carência
- requisitos por nível
- progressão validada por coordenação

### 5. Competição

- ranking de squads
- ranking individual
- histórico por ciclo ou temporada

## Fase seguinte

Quando o ambiente estiver pronto para execução, os próximos passos ideais são:

1. adicionar `Prisma` e `PostgreSQL`
2. criar autenticação
3. transformar o modelo de domínio em tabelas reais
4. criar CRUDs de membros, squads, campos e eventos
