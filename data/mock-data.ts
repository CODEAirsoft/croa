export const keyMetrics = [
  {
    label: "Praticantes ativos",
    value: "248",
    detail: "Base inicial de membros operacionais e em formação.",
  },
  {
    label: "Squads ranqueados",
    value: "16",
    detail: "Classificação por pontuação acumulada e presença em missões.",
  },
  {
    label: "Eventos no ciclo",
    value: "09",
    detail: "Treinos, operações e avaliações técnicas planejadas.",
  },
  {
    label: "Campos parceiros",
    value: "05",
    detail: "Locais cadastrados com operador responsável e capacidade.",
  },
];

export const appModules = [
  {
    title: "Cadastros centrais",
    description:
      "Base para praticantes, árbitros, rangers, operadores desportivos e campos.",
    items: [
      "Perfis com nível, status e histórico",
      "Campos com localização, operador e regras",
      "Squads com liderança, membros e desempenho",
    ],
  },
  {
    title: "Eventos e treinos",
    description:
      "Planejamento completo de calendário operacional e evolução técnica.",
    items: [
      "Eventos com capacidade, briefing e check-in",
      "Treinos por objetivo e competência avaliada",
      "Controle de presença por participante e squad",
    ],
  },
  {
    title: "Pontuação e carência",
    description:
      "Regras iniciais para mérito esportivo, evolução e regularidade do praticante.",
    items: [
      "Pontuação por participação, desempenho e conduta",
      "Carência mínima antes da subida de nível",
      "Critérios rastreáveis para evolução futura",
    ],
  },
  {
    title: "Ranking e acompanhamento",
    description:
      "Painel visual para gestão do esporte e comparação entre squads.",
    items: [
      "Ranking geral por temporada ou operação",
      "Indicadores de atividade, disciplina e constância",
      "Dashboard responsivo para gestor e coordenação",
    ],
  },
];

export const upcomingEvents = [
  {
    title: "Treino de fundamentos e segurança",
    date: "08 Abr 2026",
    location: "Campo Serra Verde",
    status: "Inscrições abertas",
    statusClass: "status-ok",
  },
  {
    title: "Operação Reconquista",
    date: "21 Abr 2026",
    location: "Arena Tática Norte",
    status: "Briefing pendente",
    statusClass: "status-warn",
  },
  {
    title: "Avaliação de progressão de recrutas",
    date: "27 Abr 2026",
    location: "Base CODE Airsoft",
    status: "Equipe pronta",
    statusClass: "status-ok",
  },
];

export const activityFeed = [
  {
    title: "Squad Lobo subiu para a 1ª posição",
    description: "A liderança veio após presença total em dois treinos e bônus disciplinar.",
  },
  {
    title: "12 recrutas completaram carência mínima",
    description: "Grupo liberado para próxima avaliação técnica e validação de conduta.",
  },
  {
    title: "Novo operador desportivo vinculado ao Campo Delta",
    description: "Cadastro aprovado com permissão para gerir eventos locais.",
  },
];

export const progressionFlow = [
  {
    order: "01",
    level: "Recruta",
    summary: "Entrada no sistema com foco em segurança, disciplina e frequência mínima.",
    requirements: [
      "Cadastro completo e aceite de regulamento",
      "Participação em treinos introdutórios",
      "Pontuação inicial por presença e postura",
    ],
  },
  {
    order: "02",
    level: "Praticante operacional",
    summary: "Fase de consolidação com controle de carência e evolução por mérito.",
    requirements: [
      "Carência mínima concluída",
      "Presença regular em treinos e operações",
      "Aprovação em critérios técnicos definidos",
    ],
  },
  {
    order: "03",
    level: "Funções avançadas",
    summary: "Abrange caminhos como árbitro, ranger e liderança operacional.",
    requirements: [
      "Histórico consistente de pontuação",
      "Competência validada por coordenação",
      "Conduta e responsabilidade acima do mínimo",
    ],
  },
];
