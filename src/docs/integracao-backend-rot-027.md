# ROT-027 — Pendências para o Backend

**Projeto:** RotaLog  
**Módulo:** Jornada do Fornecedor — Web

## 1. Cadastro de produtos pelo fornecedor

O fornecedor deve conseguir cadastrar novos produtos diretamente no catálogo oficial do RotaLog, **sem aprovação administrativa**.

**Precisamos:**
- Endpoint para cadastrar e publicar produtos pelo fornecedor autenticado.
- Validação para evitar produtos duplicados.
- Registro de quem cadastrou o produto.
- Produto disponível no catálogo compartilhado para todos os fornecedores.
- Regras para impedir alterações indevidas em produtos compartilhados.

Após cadastrar o produto, o fornecedor poderá criar sua oferta e configurar o estoque.

## 2. Gestão de ofertas

Atualmente, conseguimos criar, editar preços e pausar ofertas.

**Precisamos:**
- Consultar ofertas ativas e pausadas.
- Consultar detalhes de uma oferta pelo ID.
- Reativar ofertas pausadas.
- Evitar criação de ofertas duplicadas.
- Garantir que tentativas repetidas de criação não gerem duplicatas.

## 3. Estoque

A consulta e o ajuste de estoque já estão integrados.

**Precisamos:**
- Endpoint para consultar o histórico real de ajustes, reservas e liberações de estoque.
- Identificar corretamente o produto associado a uma oferta pausada.

## 4. Capacidade operacional

**Precisamos:**
- Endpoint definitivo para cadastrar janelas de capacidade, sem utilizar rotas de demonstração.
- Consultar as janelas de capacidade do próprio fornecedor.
- Definir regras de alteração, cancelamento e sobreposição de horários.

## 5. Pedidos e entregas

O fluxo do fornecedor já está integrado até o estado `READY_TO_DISPATCH` (Pronto para coleta).

**Precisamos:**
- Registro de coleta pelo entregador.
- Atualização do pedido para `IN_TRANSIT`.
- Registro de entrega pelo entregador.
- Confirmação de recebimento pelo comprador.
- Atualização do pedido para `DELIVERED` após as confirmações necessárias.
- Datas e histórico dos eventos de entrega.
- Tratamento de entregas parciais.
- Arquivamento automático dos pedidos entregues após 7 dias, mantendo-os disponíveis no histórico.

O fornecedor apenas acompanha a entrega. As confirmações serão feitas pelo entregador e pelo comprador.

## 6. Identificação dos pedidos

**Precisamos:**
- Campo `order_number` gerado pelo Backend, único e permanente, para identificar os pedidos sem depender do UUID.

---

## Observações

- As funcionalidades listadas são pendências de integração, não endpoints já disponíveis.
- A equipe de Backend deverá definir e informar os contratos das novas APIs.
- Após a disponibilização dos endpoints, a equipe de Frontend realizará as integrações necessárias.
- Não será necessário criar um painel administrativo para aprovação de produtos.