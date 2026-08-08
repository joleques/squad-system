# 🔍 Software Principles Revisor

**Skill de revisão de código** para aderência a princípios fundamentais de design de software (SOLID, OO, Pragmáticos).

## Para que serve?

Esta skill instrui o agente a analisar código implementado e identificar violações a princípios de software. Ela gera um **relatório de conformidade** detalhado com problemas, impacto e recomendações de correção.

## O que é analisado?

| Categoria | Verificação |
|-----------|------------|
| **SOLID — SRP** | Classes com responsabilidade única, nomes claros |
| **SOLID — OCP** | Extensibilidade sem modificação de código existente |
| **SOLID — LSP** | Subtipos substituíveis sem quebrar contratos |
| **SOLID — ISP** | Interfaces focadas, sem métodos não utilizados |
| **SOLID — DIP** | Dependência de abstrações, não de implementações |
| **Lei de Demeter** | Ausência de train wrecks, falar só com amigos |
| **Tell, Don't Ask** | Comportamento no objeto que detém os dados |
| **Composition over Inheritance** | Composição preferida à herança para reuso |
| **Program to Interface** | Tipos declarados como abstrações |
| **Encapsulate What Varies** | Pontos de variação isolados |
| **POLA** | Código previsível, sem surpresas |
| **DRY / KISS / YAGNI** | Sem duplicação, simplicidade, sem especulação |
| **Fail Fast** | Validação na entrada, erros tratados cedo |

## Quando usar?

- Após implementação pelo agente, antes de entregar ao usuário
- Antes de code review para identificar violações de princípios
- Após refatorações para validar que princípios foram mantidos

## Saída

Gera um relatório Markdown com resumo por princípio (✅/⚠️/❌), problemas encontrados com arquivo, linha, impacto e sugestão de correção.

## Referências

- [Clean Code — Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [The Pragmatic Programmer — Hunt & Thomas](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
