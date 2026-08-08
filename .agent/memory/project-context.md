# Contexto do Projeto — Squad System

## Produto

CLI distribuída pelo npm para instalar uma Squad de Chão de Fábrica em projetos existentes. A instalação é mediada pelo agente de IA que o usuário já utiliza e suporta Kiro, Codex ou ambos.

## Decisões do MVP

- quatro papéis canônicos: líder, analista, dev e reviewer;
- contexto detalhado obrigatório no spec de instalação;
- arquitetura do projeto-alvo opcional, usando `arquitetura-proposta` como padrão;
- integração preservando regras preexistentes de `AGENTS.md`;
- comunicação objetiva e continuidade de ajustes pontuais no mesmo ticket;
- instalação idempotente, diagnóstico e desinstalação segura;
- nenhuma leitura ou empacotamento de segredos.

## Arquitetura vigente

O próprio Squad System adota `domain`, `use_case`, `application`, `infra` e `shared`.

- `domain`: validação do spec, contrato da squad e manifesto;
- `use_case`: operações de instalar, inspecionar, diagnosticar e desinstalar;
- `application`: entrada da CLI e composição das dependências;
- `infra`: acesso ao filesystem, templates e projeções Kiro/Codex;
- `shared`: utilidades independentes de fluxo.

Casos de uso não importam infraestrutura. O `application/composition-root.js` injeta os adapters concretos. Um teste arquitetural impede dependências de `domain` para camadas externas e de `use_case` para `infra` ou `application`.

## Etapa atual

MVP funcional na versão de desenvolvimento `1.0.1`, com a arquitetura interna padronizada. A automação de publicação Git/npm permanece registrada para evolução posterior em `documentacao/ticket/publicacao-npm/AUT-001.md`.
