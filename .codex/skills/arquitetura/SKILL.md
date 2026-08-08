---
name: arquitetura-proposta
description: Regras de estrutura de pastas (domain, use_case, infra) e fluxo de dependências.
---

### 🏗️ Padrões de Arquitetura — conforme proposta-arq

Baseado no repositório proposta-arq como referência para arquitetura integrada orientada a casos de uso. ([GitHub][1])

#### 📁 Estrutura esperada

```
/domain        → Entidades do domínio, Value Objects, Domain Services  
/use_case      → Casos de uso (Use Cases) que representam interações do usuário/sistema  
/application   → Porta de entrada (controllers, rotas, consumidores de filas)  
/infra         → Adaptadores, repositórios, APIs externas, drivers  
/shared        → Componentes compartilhados entre contextos (tipos comuns, erros, utilitários de domínio)  
/tests         → Testes unitários, testes de integração, mocks  
```

#### 🔍 Principais características

- Os **Use Cases** residem em sua própria camada (`/use_case`), distinta da camada de aplicação (`/application`). ([GitHub][1])
- A camada de aplicação (“application”) é a **porta de entrada** do serviço (controllers, consumidores) e **delega para use cases**.
- A camada de domínio (`/domain`) contém **todas as regras de negócio reais**, sem dependência de infra-estrutura.
- Infraestrutura (`/infra`) implementa adaptadores e concretizações, separada da camada de domínio e de aplicação.
- Shared (`/shared`) reúne tipos genéricos e reutilizáveis entre camadas, evitando acoplamento entre contextos distintos.
- Dependências fluem somente **de fora para dentro**: infra → application → use_case → domain. Nunca o contrário.

#### 🛠️ Convenções de código

- **Entidades** e **Value Objects** devem residir em `/domain`.
- **Repositórios/interfaces** definidas no domínio ou use_case, implementações em `/infra`.
- **Use Cases** (“faça isso”, “execute aquilo”) na camada `/use_case`. Devem definir entradas/saídas, lógica de orquestração, e invocar domínio.
- **Controllers/Handlers** em `/application` recebem requisições e delegam para use cases. NÃO devem conter lógica de negócio.
- Infraestrutura (`/infra`) implementa a persistência, serviços externos, drivers, adaptadores.
- Nenhuma regra de negócio deve “vazar” para infraestrutura ou aplicação: dominio é soberano.

---

[1]: https://github.com/joleques/proposta-arq "GitHub - joleques/proposta-arq"
