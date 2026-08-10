---
name: plano-implementacao
description: Gera o plano obrigatorio antes de implementar, detalhando o que vai mudar e onde vai mudar para bug e implementacao, e bloqueia a execucao ate aprovacao explicita do usuario.
---

# Plano de Implementacao

Use esta skill em toda demanda classificada como `bug` ou `implementacao`.
Nao use esta skill para `analise`.

## Objetivo

Criar um plano claro, verificavel e aprovavel pelo usuario antes de qualquer implementacao.

## Regras obrigatorias

- Nenhuma implementacao comeca sem plano.
- Nenhuma implementacao comeca sem aprovacao explicita do usuario.
- O plano deve ser detalhado o suficiente para que o usuario consiga revisar a abordagem proposta.

## Estrutura do plano

### Para `bug`

- Descrever o problema a ser corrigido.
- Informar o que vai mudar e onde vai mudar.
- Informar quais testes vao reproduzir o problema e impedir recorrencia.
- Informar riscos de regressao ou pontos de impacto.

### Para `implementacao`

- Descrever o que sera entregue (melhoria, evolucao ou nova funcionalidade) e o objetivo.
- Informar o que vai mudar e onde vai mudar.
- Informar os componentes principais que serao criados ou adaptados, quando ja conhecidos.
- Informar impactos esperados em codigo, contratos ou fluxos.
- Informar testes que vao proteger o comportamento entregue.

## Gate de aprovacao

- O agente deve apresentar o plano e aguardar o usuario informar explicitamente que ele esta aprovado.
- Se o usuario pedir ajuste, o agente deve revisar o plano e reapresenta-lo.
- Enquanto nao houver aprovacao explicita, a execucao deve permanecer bloqueada.

## Gate de testes antes de implementar

Depois da aprovacao do plano e antes de editar arquivos:

1. rodar o comando de teste definido em `documentacao/squad-config.md`;
2. se houver falha pre-existente, interromper a implementacao;
3. analisar a falha;
4. discutir com o usuario antes de seguir.

## Resultado esperado

Persista o plano no ticket. O líder apresenta ao usuário somente a síntese necessária à decisão e aguarda aprovação explícita. Após a decisão, encaminhe caminho do ticket, status e próximo passo, sem retransmitir o plano integral.
