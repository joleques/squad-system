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

## Publicação

Cada versão publicada no npm é imutável. Atualize o campo `version` seguindo versionamento semântico antes de uma nova publicação.

```bash
nvm use
npm test
npm pack --dry-run
npm publish
```

O pacote é público sob o escopo `@joleques` e a publicação exige autenticação npm com 2FA.

## Fora do MVP

- atualização automática;
- publicação automática por CI;
- Claude e Cursor;
- Jira obrigatório;
- squads de UX ou de orquestração da Fábrica.
