# Contexto do Projeto — @joleques/squad-system

## Descrição

CLI distribuída pelo npm para instalar uma Squad de Chão de Fábrica em projetos existentes, com suporte integrado a Kiro e Codex.

## Propósito

Padronizar a condução de demandas de engenharia com papéis de liderança, análise, desenvolvimento e revisão, preservando instruções locais e oferecendo instalação, diagnóstico e desinstalação seguros.

## Usuários

Pessoas desenvolvedoras e equipes de engenharia que usam agentes Kiro ou Codex para analisar, planejar, implementar e revisar mudanças em repositórios existentes.

## Domínio

Instalação e gestão de contratos operacionais para squads de agentes de engenharia, incluindo contexto de projeto, papéis canônicos, projeções por ferramenta, escrita transacional, diagnóstico, idempotência e preservação de arquivos existentes.

## Stack

Node.js 18+ em CommonJS, CLI npm sem dependências externas, testes nativos com node:test e arquitetura em domain, use_case, application, infra e shared.

## Integrações

Nenhuma informada.

## Restrições

Nenhuma informada.

## Arquitetura

Padrão arquitetura-proposta: domain, use_case, application, infra e shared; dependências apontam para dentro.

## Estágio atual

MVP funcional com publicação versionada automatizada por tags SemVer, GitHub Actions e npm Trusted Publishing/OIDC. Releases patch, minor e major possuem gates locais e push atômico de commit e tag. O contrato operacional usa handoffs mínimos por referência ao ticket, preservando aprovação explícita, TDD, revisão técnica e validação final do usuário.
