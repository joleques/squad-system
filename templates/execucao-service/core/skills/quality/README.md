# 🧪 Quality Assurance

**Skill de regras para TDD, cobertura de testes e validação de código.**

## Para que serve?

Esta skill instrui o agente a garantir qualidade de código através de testes e boas práticas, definindo padrões mínimos de cobertura e o Definition of Done para entregáveis.

## Regras Principais

### Cobertura de Testes
- Todo novo artefato exige teste correspondente
- Foco em testes **unitários** + **integração em pontos críticos**
- Testes de API devem usar obrigatoriamente **mocks** para HTTP/DB

### Execução
- Sempre executar ou simular testes e mostrar resultado (`PASS` / `FAIL`)

### Definition of Done
1. Código limpo e testado
2. Sem nomes genéricos
3. Logs estruturados em inglês via `logAdapter`
4. Documentação sugerida/atualizada

## Quando usar?

- Ao criar novos artefatos de código (sempre acompanhar com testes)
- Para validar que código existente atende ao padrão de qualidade
- Como guia para Definition of Done em entregas
