---
name: triagem-demanda
description: Valida a classificacao da demanda em analise, bug ou implementacao, trata pedidos claramente investigativos como analise e aplica o protocolo correto de execucao.
---

# Triagem de Demanda

Use esta skill no inicio da conversa ou quando a natureza da demanda mudar durante o chat.

## Objetivo

Garantir que a demanda esteja classificada corretamente antes de qualquer analise aprofundada, plano de implementacao ou alteracao de arquivos.

## Tipos aceitos

- `analise`
- `bug`
- `implementacao`

## Regras obrigatorias

- Se o pedido for claramente para ler, entender, revisar, analisar ou explicar algo, o agente pode classifica-lo automaticamente como `analise`.
- Qualquer alteracao de codigo, testes ou configuracao exige classificacao explicita em `bug` ou `implementacao`.
- `bug` e `implementacao` sao demandas de implementacao e seguem para plano obrigatorio antes de alterar arquivos.
- Em `analise`, o agente pode analisar documentacao e codigo, mas nao pode alterar arquivos de implementacao, testes ou configuracao.
- Em `analise`, o agente nao precisa rodar testes antes nem depois, porque nao ha implementacao.
- Se a demanda mudar de natureza no meio da conversa, o agente deve solicitar reclassificacao antes de seguir.

## Distincao entre bug e implementacao

- `bug`: corrigir comportamento que ja deveria funcionar. Exige teste que reproduza o problema antes da correcao.
- `implementacao`: qualquer entrega que cria ou altera comportamento esperado (melhoria, evolucao, nova funcionalidade). Exige teste que proteja o comportamento entregue.

## Fluxo

1. Verifique se o pedido ja e claramente de leitura, entendimento, revisao, analise ou explicacao.
2. Se sim, trate a demanda como `analise`.
3. Se nao for claramente analitica, verifique se o usuario informou `bug` ou `implementacao`.
4. Se nao informou e houver intencao de mudanca, solicite a classificacao e nao avance.
5. Se informou `analise`, limite a execucao a analise e resposta.
6. Se informou `bug` ou `implementacao`, encaminhe para a skill `plano-implementacao`.
7. Se o pedido atual contradiz a classificacao anterior, interrompa e solicite reclassificacao.

## Sinais de alerta

- Pedido tratado como `analise` contendo verbos como "implementar", "alterar", "corrigir", "criar", "remover" ou "ajustar".
- Pedido classificado como `bug` sem expectativa de reproduzir o problema via teste.
- Pedido de implementacao sem plano aprovado pelo usuario.

## Resultado esperado

Ao final da triagem, o chat deve estar em um destes estados:

- demanda bloqueada aguardando classificacao de implementacao;
- demanda bloqueada aguardando reclassificacao;
- demanda validada como `analise`;
- demanda validada como `bug` ou `implementacao` para seguir ao plano de implementacao.
