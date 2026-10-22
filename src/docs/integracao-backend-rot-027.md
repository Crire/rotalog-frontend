# ROT-027 — Dependências de Integração com o Backend

**Projeto:** RotaLog  
**Módulo:** Jornada do Fornecedor — Frontend Web  
**Situação:** Pendente de alinhamento com a equipe de Backend

## 1. Contexto

O Frontend da jornada do fornecedor já está integrado aos endpoints de pedidos até o estado `READY_TO_DISPATCH` (Pronto para coleta).

Para concluir o acompanhamento dos pedidos, precisamos que o Backend disponibilize operações logísticas e a confirmação de recebimento pelo comprador.

O fornecedor apenas acompanha a entrega. As confirmações serão realizadas pelo entregador, no aplicativo Mobile, e pelo comprador.

## 2. Endpoints solicitados

Os caminhos abaixo são propostas e precisam ser confirmados pela equipe de Backend.

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/v1/driver/fulfillments` | Listar atendimentos atribuídos ao entregador |
| POST | `/api/v1/fulfillments/{id}/pickup` | Registrar coleta |
| POST | `/api/v1/fulfillments/{id}/transport-events` | Registrar eventos do transporte |
| POST | `/api/v1/fulfillments/{id}/delivery` | Registrar entrega pelo entregador |
| POST | `/api/v1/supplier-orders/{id}/receipt-confirmation` | Confirmar recebimento pelo comprador |

## 3. Endpoints existentes que precisam de atualização

### GET `/api/v1/supplier-orders`

Precisamos que a listagem permita:

- Identificar pedidos em transporte.
- Identificar pedidos aguardando confirmação do comprador.
- Identificar pedidos entregues.
- Consultar pedidos ativos e históricos.
- Aplicar a regra de arquivamento após 7 dias.

Filtros sugeridos:

- `?view=active`
- `?view=history`

### GET `/api/v1/supplier-orders/{id}`

Campos adicionais sugeridos:

- `picked_up_at`
- `delivered_at`
- `buyer_received_at`
- `archive_at`
- `delivery_events`

Os nomes e formatos deverão ser definidos pela equipe de Backend.

## 4. Estados logísticos propostos

| Estado | Significado |
|---|---|
| `READY_TO_DISPATCH` | Pedido pronto para coleta |
| `IN_TRANSIT` | Pedido coletado e em transporte |
| `AWAITING_BUYER_RECEIPT` | Entregador registrou a entrega; aguardando comprador |
| `DELIVERED` | Entrega e recebimento confirmados |

Os novos estados ainda não estão implementados e precisam ser alinhados com o modelo existente.

## 5. Regras de negócio

1. O entregador registra a coleta e a entrega pelo Mobile.
2. O comprador confirma o recebimento.
3. O pedido somente é considerado entregue após ambas as confirmações.
4. Pedidos entregues permanecem no Kanban por 7 dias (168 horas), contados da confirmação do comprador.
5. Após esse período, passam a aparecer no Histórico, sem exclusão dos registros.
6. Entregas parciais devem respeitar os lotes e as quantidades efetivamente recebidas.
7. O fornecedor não poderá confirmar coleta, entrega ou recebimento.

## 6. Dependências do Frontend ROT-027

Após a disponibilização dos contratos, o Frontend deverá:

- Integrar as colunas Em transporte e Entregues.
- Exibir o estado intermediário de confirmação pendente.
- Atualizar os detalhes dos pedidos.
- Integrar o Histórico com a API.
- Atualizar os indicadores do Dashboard.
- Manter a compatibilidade com o fluxo existente.

As melhorias visuais do Kanban, incluindo responsividade e redução da exibição de UUIDs, podem ser desenvolvidas independentemente dessas entregas.

## 7. Pontos para alinhamento com o Backend

- [ ] Confirmar os caminhos definitivos dos endpoints.
- [ ] Definir os contratos de requisição e resposta.
- [ ] Confirmar os estados logísticos.
- [ ] Definir autenticação e permissões.
- [ ] Definir vínculo entre entregador e atendimento.
- [ ] Definir tratamento de entregas parciais.
- [ ] Disponibilizar datas e eventos logísticos.
- [ ] Implementar a regra de arquivamento após 7 dias.
- [ ] Disponibilizar documentação OpenAPI/Swagger atualizada.

## 8. Responsabilidades

**Backend:** implementação dos endpoints, regras de negócio, persistência e permissões.

**Frontend Web (ROT-027):** apresentação dos pedidos, Kanban, Dashboard, Histórico e consumo da API.

**Mobile:** registro das operações do entregador.

**Jornada do comprador:** confirmação do recebimento.

---

**Observação:** este documento registra dependências de integração. Não significa que os endpoints propostos já estejam disponíveis.