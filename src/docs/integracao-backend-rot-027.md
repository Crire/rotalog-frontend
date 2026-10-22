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

## Preparação implementada no Web

O modo API apresenta seis colunas e reconhece, apenas para exibição, os estados
propostos `IN_TRANSIT`, `AWAITING_BUYER_RECEIPT` e `DELIVERED`. A confirmação do
comprador pendente aparece em Em transporte. Estados desconhecidos continuam
acessíveis em Outros estados. Nenhum comando logístico foi adicionado ao fornecedor.

Enquanto o contrato não informar a classificação de arquivamento pelo servidor,
`DELIVERED` permanece ativo. Recusados, cancelados e expirados continuam no Histórico.
Não há cálculo local dos sete dias, datas presumidas ou mudança de pedidos persistidos.
A futura integração deve adicionar campos confirmados pelo Backend e testes de contrato
antes de consumir qualquer classificação de arquivamento.

Cartões, Dashboard e detalhes utilizam a função `orderLabel`: na ausência de número
comercial, exibem os primeiros oito caracteres do UUID, em maiúsculas, como
`Pedido #F1E10A37`. Essa abreviação não garante unicidade, não substitui o UUID e não
é usada nas requisições. Os detalhes permitem consultar e copiar os UUIDs completos.

Quando dois pedidos carregados da organização compartilham o prefixo, a função
expande o código em blocos de quatro caracteres até diferenciá-los. A comparação
usa a lista completa carregada, antes dos filtros, ordenação ou limite do Dashboard.
A chegada de outro pedido pode expandir o rótulo; colisões com pedidos não carregados
não podem ser detectadas. Nenhuma associação ou autorização utiliza esse rótulo.

Solicitação ao Backend: fornecer `order_number`, gerado pelo servidor, estável e
garantido como único por restrição no banco, nas respostas de listagem e detalhes.
O Web já aceita esse campo opcional e o prioriza quando não vazio, sem gerar números
sequenciais locais. O campo continua proposto, sem confirmação no contrato atual.

O Kanban mantém uma única área de rolagem vertical e horizontal, com colunas de
largura legível e controles que se reorganizam em telas pequenas. O modo mock e
seus serviços permanecem separados.
