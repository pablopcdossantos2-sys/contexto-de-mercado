# Contexto de Mercado

**Português** · [English](README.en.md) · [Español](README.es.md)

Web portfólio educacional e curso prático dedicado a ensinar traders iniciantes a compreenderem o **contexto de mercado antes de executar operações**.

O projeto combina teoria, rotina, registro e treino deliberado. A proposta não é fornecer sinais de compra ou venda, e sim ensinar o usuário a organizar perguntas, hipóteses e revisões.

## Competências trabalhadas

1. **Observar** — regime, localização, volatilidade, horário, referências, fluxo e eventos.
2. **Interpretar** — aceitação, rejeição, equilíbrio, iniciativa e mudança de comportamento.
3. **Planejar** — cenários condicionais, invalidações e condições de não-operação.
4. **Executar com disciplina** — separar contexto de gatilho.
5. **Revisar** — comparar plano e realidade sem confundir resultado financeiro com qualidade de processo.

## Conteúdo atual

### Artigos

- O que é contexto de mercado?
- Tendência, range e transição.
- Leitura top-down e mapa de níveis.
- Abertura do mercado e horários do pregão.
- Localização do preço, máximas/mínimas e VWAP.
- Volatilidade, compressão e expansão.
- Liquidez, volume e agressão.
- Gaps, aceitação, rejeição e falsos rompimentos.
- Correlação e leitura intermercado.
- Eventos macroeconômicos e risco de calendário.

### Trilhas e avaliação

- **Trilha Iniciante** — fundamentos, regime, top-down, localização, volatilidade, rotina, exercício visual e quiz.
- **Trilha Intraday** — horários, localização, volatilidade, gaps, intermercado, macro e avaliações.
- **Trilha Leitura de Fluxo** — liquidez, volume, agressão, aceitação/rejeição e avaliação específica.
- **Classificação de Regimes** — seis gráficos sintéticos com feedback.
- **Informação x Ruído** — exercício de relevância contextual.
- **Quizzes por trilha** — nota mínima de 80% para conclusão.
- **Progresso local por módulo** — integrado aos artigos e avaliações.
- **Certificado educacional local** — liberado somente após os requisitos; sem valor acadêmico/profissional.

### Rotina

- Preparação pré-mercado em sete etapas.

### Ferramentas

- **Checklist de Contexto** — preparação pré-mercado, salvamento local e exportação TXT.
- **Diário de Contexto** — pré/pós-mercado, histórico local, backup JSON e importação.
- **Laboratório de Cenários** — exercícios de construção de hipóteses no formato se/então.
- **Plano x Mercado Real** — revisão de leitura, atualização, execução e disciplina.
- **Replay de Contexto** — carrega uma captura inicial e uma continuação; a continuação fica oculta até a leitura inicial ser travada.
- **Replay Guiado** — biblioteca de sessões sintéticas reveladas em quatro etapas, com leitura travada a cada avanço.
- **Painel do Processo** — métricas de preparação, respeito ao plano, operações fora de cenário, atualização tardia, regimes, leitura × execução e qualidade dos dados.

## Privacidade e dados

As ferramentas atuais são estáticas e armazenam os registros no **armazenamento local do navegador**. O projeto não possui backend nem envia os registros do usuário para um servidor próprio.

O Diário de Contexto mantém seu backup individual, e a página **Gerenciar dados** oferece backup/restauração global de todos os conjuntos do projeto. Limpar os dados do navegador pode apagar os registros locais se o usuário não tiver feito backup.

## Uso local e GitHub Pages

O projeto usa HTML, CSS e JavaScript puro, sem dependências obrigatórias. Pode ser servido pelo GitHub Pages ou aberto localmente a partir de index.html.

## Princípios

- Contexto não é previsão.
- Correlação não implica causalidade.
- Volume e agressão não revelam intenção com certeza.
- Rompimento visual não equivale automaticamente a aceitação.
- Resultado financeiro isolado não mede qualidade do processo.
- “Não operar” é uma decisão operacional válida.

## Aviso educacional

Todo o conteúdo tem finalidade exclusivamente educacional. Nada neste projeto constitui recomendação de investimento, promessa de resultado ou sinal operacional. Trading envolve risco de perda financeira.


## Rotina especializada para WINFUT e WDOFUT

- `rotina/leitura-pre-pregao-winfut-wdofut.html` — tutorial diário com contexto macro/intermercado, estrutura multi-horizonte, suportes e resistências recentes/históricos, volatilidade, cenários condicionais e checklist local.
- `ferramentas/volatilidade-historica-winfut-wdofut.html` — calcula no navegador amplitude diária, medianas de 5/20 pregões, percentil empírico, true range e ATR-14 a partir de CSV OHLC; permite mapear colunas e exportar CSV, sem enviar o arquivo a servidor.
