# 🏗️ Arquitetura Proposta

**Skill de regras de estrutura de pastas e fluxo de dependências** baseada no repositório [proposta-arq](https://github.com/joleques/proposta-arq).

## Para que serve?

Esta skill define o **padrão de arquitetura integrada orientada a casos de uso** que o agente deve seguir ao criar ou analisar código. Ela estabelece a estrutura de pastas esperada e as regras de dependência entre camadas.

## Estrutura de Pastas

```
/domain        → Entidades, Value Objects, Domain Services
/use_case      → Casos de uso (orquestração de negócio)
/application   → Porta de entrada (controllers, rotas, consumidores)
/infra         → Adaptadores, repositórios, APIs externas
/shared        → Componentes compartilhados entre contextos
/tests         → Testes unitários, de integração e mocks
```

## Regras Fundamentais

- **Use Cases** residem em camada própria (`/use_case`), separados da camada de aplicação
- **Application** é porta de entrada e **delega** para use cases — sem lógica de negócio
- **Domain** contém todas as regras de negócio, sem dependência de infraestrutura
- **Dependências** fluem de fora para dentro: `infra → application → use_case → domain`

## Quando usar?

- Ao iniciar um novo projeto que siga o padrão proposta-arq
- Como referência para organizar camadas e dependências
- Para validar se a estrutura de um projeto existente está aderente
