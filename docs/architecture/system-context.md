# System Context

High-level view of the AI Customer Operations Platform and its primary actors.

```mermaid
flowchart LR
    subgraph Users
        Operator[Operator]
        Admin[Tenant Admin]
        EndCustomer[End Customer]
    end

    subgraph Platform[AI Customer Operations Platform]
        FE[Frontend Apps<br/>Dashboard / Workflow Builder / Admin]
        GW[API Gateway]
        AUTH[Auth Service]
        TEN[Tenant Service]
        AI[AI Agent Service]
        WF[Workflow Service]
        EV[Event Service]
        AN[Analytics Service]
        DB[(PostgreSQL<br/>+ pgvector)]
        REDIS[(Redis<br/>Streams + Cache)]
        BUS[[Event Bus<br/>Redis Streams → EventBridge]]
    end

    subgraph External
        LLM[OpenAI / LLM Providers]
        OTEL[Grafana / Loki / Tempo]
    end

    Operator --> FE
    Admin --> FE
    EndCustomer -->|Chat / Email / Webhook| GW

    FE --> GW
    GW --> AUTH
    GW --> TEN
    GW --> AI
    GW --> WF
    GW --> EV
    GW --> AN

    AI --> LLM
    AI --> DB
    AI --> BUS
    WF --> BUS
    EV --> BUS
    BUS --> AI
    BUS --> WF
    BUS --> AN

    AUTH --> DB
    TEN --> DB
    EV --> DB
    AN --> DB
    AI --> REDIS
    WF --> REDIS

    Platform -.OTLP.-> OTEL
```

## Key Properties

- **Multi-tenant by default**: every API call and every event carries a `tenantId`.
- **Event-driven backbone**: services communicate via the event bus for async work;
  REST/GraphQL only for synchronous CRUD.
- **Tenant-aware AI**: agents retrieve only their tenant's vector embeddings.
- **Observability is end-to-end**: a `correlationId` flows from the browser through
  every service, every event, and every AI tool call.
