# 🔍 Arquitetura Revisor

**Skill de revisão de código** para aderência ao padrão proposta-arq (Clean Architecture + Hexagonal + DDD).

## Para que serve?

Esta skill instrui o agente a analisar projetos existentes e identificar violações ao padrão de arquitetura integrada orientada a casos de uso. Ela gera um **relatório de conformidade** detalhado com problemas e recomendações.

## O que é analisado?

| Categoria | Verificação |
|-----------|------------|
| **Estrutura de Pastas** | Presença e nomes corretos das camadas |
| **Fluxo de Dependências** | Unidirecionalidade (`infra → application → use_case → domain`) |
| **Camada Application** | Não contém lógica de negócio, apenas delega |
| **Camada Use Case** | Responsabilidade única, DTOs definidos |
| **Camada Domain** | Independente de tecnologia/frameworks |
| **Camada Infrastructure** | Implementa interfaces, sem regras de negócio |
| **Componente Shared** | Código genuinamente reutilizável |

## Quando usar?

- Para revisar um projeto existente antes de code review
- Após refatorações para validar que o padrão foi mantido
- Para identificar violações estruturais em projetos legados

## Saída

Gera um relatório Markdown com resumo por categoria (✅/⚠️/❌), problemas encontrados e recomendações.

## Referência

- [proposta-arq](https://github.com/joleques/proposta-arq)
