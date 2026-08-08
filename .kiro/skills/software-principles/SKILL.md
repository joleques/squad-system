---
name: software-principles
description: Especialista em princípios de software — SOLID, OO, Pragmáticos. Sabe identificar violações e recomendar correções com foco em simplicidade.
---

# 🧱 Princípios de Software

Skill para análise e recomendação baseada em princípios fundamentais de design de software.

> [!IMPORTANT]
> **Filosofia Core:** Princípios são guias, não regras absolutas. O contexto sempre vence a teoria.

---

## 🏛️ SOLID

### S — Single Responsibility Principle (SRP)

> Uma classe deve ter apenas um motivo para mudar.

| ✅ Sinais de Aderência | ❌ Sinais de Violação |
|------------------------|----------------------|
| Classe tem nome claro e específico | Nome genérico (`Manager`, `Helper`, `Utils`) |
| Poucas dependências | Muitas dependências injetadas (5+) |
| Testes focados e simples | Testes precisam de muitos mocks |
| Cabe em ~200 linhas | Arquivo gigante (500+ linhas) |

**Pergunta-chave:** *"Se eu descrever o que essa classe faz, uso a palavra 'E'?"* → Se sim, separe.

### O — Open/Closed Principle (OCP)

> Aberto para extensão, fechado para modificação.

| ✅ Use Quando | ❌ Evite Quando |
|--------------|----------------|
| Novos tipos/comportamentos surgem frequentemente | Há apenas 1-2 variações estáveis |
| `switch/if` cresce a cada sprint | Um `if` simples resolve sem polimorfismo |
| Plugins ou extensibilidade são requisitos | Over-engineering "preventivo" |

**Mecanismos:** Strategy, Template Method, Decorator, polimorfismo.

### L — Liskov Substitution Principle (LSP)

> Subtipos devem ser substituíveis por seus tipos base sem quebrar o programa.

**Violações comuns:**
- Subclasse lança exceção não esperada pelo contrato
- Subclasse ignora/sobrescreve comportamento com `no-op`
- Pré-condições mais restritivas ou pós-condições mais fracas
- O clássico: `Square extends Rectangle`

**Teste mental:** *"Posso usar a subclasse em QUALQUER lugar que o pai é usado sem surpresas?"*

### I — Interface Segregation Principle (ISP)

> Clientes não devem depender de interfaces que não utilizam.

| ✅ Sinais de Aderência | ❌ Sinais de Violação |
|------------------------|----------------------|
| Interfaces com 3-5 métodos focados | Interface com 10+ métodos |
| Todo implementador usa TODOS os métodos | Implementador com métodos `throw UnsupportedOperation` |
| Nome da interface descreve um papel/capacidade | Nome genérico (`IService`, `IManager`) |

**Regra prática:** Se a interface tem métodos que nem todo implementador precisa → **segregue**.

### D — Dependency Inversion Principle (DIP)

> Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

| Camada | Depende de |
|--------|-----------|
| Use Case / Application | Interfaces (Ports) |
| Domain | Nada externo |
| Infrastructure | Interfaces definidas pelo domínio |

**Teste:** *"Se eu trocar o banco de dados, preciso alterar regras de negócio?"* → Se sim, DIP violado.

---

## 🧭 Princípios Gerais de Design OO

### Lei de Demeter (LoD)

> Fale só com amigos imediatos, nunca com estranhos.

```java
// ❌ Train wreck — conhece estrutura interna
order.getCustomer().getAddress().getCity();

// ✅ Delegação — pede ao objeto que sabe
order.getDeliveryCity();
```

**Um método só pode chamar métodos de:**
1. O próprio objeto (`this`)
2. Parâmetros recebidos
3. Objetos criados dentro do método
4. Atributos diretos do objeto

### Tell, Don't Ask

> Diga aos objetos o que fazer; não pergunte seu estado para decidir por eles.

```java
// ❌ Ask — lógica do lado de fora
if (account.getBalance() > amount) {
    account.setBalance(account.getBalance() - amount);
}

// ✅ Tell — objeto decide internamente
account.withdraw(amount);
```

### Composition over Inheritance

> Prefira composição à herança para reutilizar comportamento.

| Herança | Composição |
|---------|-----------|
| Acoplamento forte (caixa branca) | Acoplamento fraco (caixa preta) |
| Hierarquia rígida | Flexível em runtime |
| Fragilidade da classe base | Delegação explícita |

**Use herança:** relações `é-um` verdadeiras e estáveis.
**Use composição:** relações `tem-um` ou `usa-um`.

### Program to an Interface

> Declare tipos usando interfaces/abstrações, não classes concretas.

### Encapsulate What Varies

> Isole o que muda do que permanece estável.

Identifique os "pontos quentes" do sistema e esconda-os atrás de abstrações.

### Principle of Least Astonishment (POLA)

> O código deve se comportar como o leitor espera.

Nomes, retornos, efeitos colaterais — tudo deve ser previsível.

---

## 🔧 Princípios Pragmáticos

| Princípio | Essência | ⚠️ Cuidado |
|-----------|----------|-----------|
| **DRY** — Don't Repeat Yourself | Cada conhecimento, uma representação | Não abstraia cedo demais (Rule of 3) |
| **KISS** — Keep It Simple | A solução mais simples que funciona | "Simples" ≠ "simplório" |
| **YAGNI** — You Aren't Gonna Need It | Não construa para requisitos especulativos | Não ignore requisitos não-funcionais reais |
| **Boy Scout Rule** | Deixe o código mais limpo do que encontrou | Não refatore o mundo em um commit |
| **Fail Fast** | Detecte e reporte erros o mais cedo possível | Valide na entrada, não no meio do fluxo |

---

## 🔍 Instruções de Análise

### Ao Revisar Código

Procure por:
- **SRP:** Classes com muitas responsabilidades ou nomes genéricos
- **OCP:** `switch/if` que crescem a cada novo tipo
- **LSP:** Subclasses que quebram o contrato do pai
- **ISP:** Interfaces com métodos não utilizados por todos os implementadores
- **DIP:** Camadas de alto nível importando classes concretas de infra
- **LoD:** Train wrecks (`a.getB().getC().doSomething()`)
- **Tell, Don't Ask:** Getters usados para tomar decisões externas

### Formato de Recomendação

```markdown
## Análise de Princípio

**Princípio:** [Nome]
**Local:** [Classe/Método afetado]

### Veredicto: ✅ Aderente / ⚠️ Parcial / ❌ Violação

### Evidência
- [Trecho de código ou descrição]

### Impacto
- [O que essa violação causa: acoplamento, fragilidade, dificuldade de teste, etc.]

### Recomendação
- [Ação sugerida com exemplo de código quando aplicável]
```

---

## 📚 Referências

- [Clean Code — Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Agile Software Development — Robert C. Martin](https://www.amazon.com/Agile-Software-Development-Principles-Practices/dp/0135974445)
- [The Pragmatic Programmer — Hunt & Thomas](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
- [Object-Oriented Software Construction — Bertrand Meyer](https://www.amazon.com/Object-Oriented-Software-Construction-Bertrand-Meyer/dp/0136291554)

> 💡 **Lembre-se:** Princípios são bússola, não GPS. Use-os para guiar decisões, não para justificar dogmas.
