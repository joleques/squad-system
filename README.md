# Squad System

Instala uma Squad de Chão de Fábrica em projetos existentes para **Kiro**, **Codex** ou ambos.

O usuário conversa com o agente que já está usando. O agente inspeciona o projeto, integra semanticamente o `AGENTS.md` e executa a instalação. A CLI cuida das operações determinísticas: escrita transacional, propriedade, diagnóstico e desinstalação.

## MVP

- quatro papéis: líder, analista, dev e reviewer;
- instalação Kiro e Codex;
- contexto detalhado obrigatório;
- arquitetura opcional, com fallback para `arquitetura-proposta`;
- preservação do `AGENTS.md` existente;
- instalação idempotente;
- respostas curtas e orientadas à decisão;
- ajustes da mesma entrega sem reiniciar a demanda;
- contrato operacional completo em `AGENTS.md`;
- papéis canônicos em `.agent/subagents/`, projetados para Kiro e Codex;
- diagnóstico e desinstalação segura;
- nenhuma leitura de `.env` ou secrets.

## Uso pelo agente

Requer Node.js 18 ou superior. Para desenvolvimento e publicação, o projeto usa Node.js 22.

```bash
npx @joleques/squad-system inspect --path /caminho/do/projeto
npx @joleques/squad-system init --path /caminho/do/projeto --spec /tmp/install-spec.json
npx @joleques/squad-system doctor --path /caminho/do/projeto
```

O `install-spec.json` é preparado pelo agente após ler o diagnóstico, a documentação e o código relevante:

```json
{
  "name": "checkout-api",
  "description": "Descrição detalhada do produto e do papel deste projeto.",
  "purpose": "Problema que o projeto resolve.",
  "users": "Usuários e operadores.",
  "domain": "Linguagem e capacidades do domínio.",
  "stack": "typescript-node",
  "testCommand": "npm test",
  "stage": "MVP em desenvolvimento",
  "tools": ["kiro", "codex"]
}
```

Para visualizar as mudanças:

```bash
npx @joleques/squad-system init --spec /tmp/install-spec.json --dry-run
```

## Integração do AGENTS.md

Se o arquivo não existir, a squad cria o padrão. Se existir, o agente deve analisar conflitos e pode fornecer `agentsIntegration` no spec. A seção da squad fica entre marcadores gerenciados, permitindo reinstalação sem duplicação.

## Diagnóstico e remoção

```bash
npx @joleques/squad-system doctor
npx @joleques/squad-system uninstall --dry-run
npx @joleques/squad-system uninstall
```

A remoção restaura arquivos anteriores quando possível. Arquivos gerenciados que tenham sido modificados pelo usuário são preservados.

## Arquitetura interna

O código segue o padrão `arquitetura-proposta`:

```text
src/
├── domain/       # contratos e regras puras da instalação
├── use_case/     # instalação, diagnóstico, inspeção e remoção
├── application/  # CLI, argumentos e composition root
├── infra/        # filesystem, templates e emissores Kiro/Codex
└── shared/       # constantes e hash compartilhados
```

As dependências apontam para dentro. Os casos de uso recebem filesystem, templates e emissores por injeção; somente o `composition-root` conhece simultaneamente casos de uso e infraestrutura. O teste `tests/architecture/dependency-rule.test.js` protege essa regra.

## Publicação

Cada versão publicada no npm é imutável. A publicação é feita pelo GitHub Actions quando uma tag estritamente SemVer (`vX.Y.Z`) corresponde à versão do `package.json`.

Antes do primeiro release, configure um Trusted Publisher no pacote `@joleques/squad-system` no npm:

- provider: GitHub Actions;
- organization or user: `joleques`;
- repository: `squad-system`;
- workflow filename: `publish.yml`;
- allowed action: `npm publish`.

O fluxo usa OIDC e não requer `NPM_TOKEN`. Para preparar e enviar um release, a árvore Git deve estar limpa e o remote `origin` configurado:

```bash
nvm use
make test
make pack
make release-patch # ou release-minor / release-major
```

O comando de release executa os gates locais, usa `npm version` para criar commit e tag e envia ambos atomicamente. O workflow repete instalação determinística, testes e validação do pacote antes de publicar.

## Fora do MVP

- atualização automática;
- publicação automática por CI;
- Claude e Cursor;
- Jira obrigatório;
- squads de UX ou de orquestração da Fábrica.
