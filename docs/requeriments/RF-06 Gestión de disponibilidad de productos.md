# RF-06 Gestión de disponibilidad de productos

Responsable: @Neyzer

Prioridad: Media  
Actor: Gerente y Supervisor

:::warning
Nerfeado para el [MVP - Cuatri 8vo](https://docs.neyzt.org/s/general/p/mvp-cuatri-8vo-R10j7t7vPh)
:::

## Descripción

El gerente o supervisor podrá seleccionar si un producto está agotado o no, impidiendo que los clientes puedan pedir ese producto en concreto. Esto será un valor estatus de activo o inactivo.

De igual manera, un producto puede configurarse de tener un limite por pedido.

## Flujo

1. Al dar de alta un producto, tendrá campo obligatorio para dar un limite de productos por pedido (puede ser ilimitado)
2. Lo da de alta con un limite de N
3. Gerente/Supervisor entra a su panel de la sucursal
4. Busca el producto y lo marca como agotado
5. Los clientes verán el producto, pero con un aviso de agotado y no podrán pedirlo
6. El gerente/supervisor podrá volver desenmarcar el agotado
7. Los clientes ya podrán pedir el producto
8. Al agregar el producto, el cliente podrá pedir máximo N cantidad de ese articulo.

## Dependencias y restricciones

Depende de:

- RF-05 Gestión del menú
- RF-08 Consulta del menú
- RF-10 Registro de pedidos

Restricciones:

- RN-12 Cada producto podrá definir un límite máximo de unidades por pedido.

## Contrato de implementación

La relación producto↔sucursal es una fila `ProductStock` (PK compuesta
branch+product) cuyo estado `stock` es `-1` (sin control activado, disponible),
`0` (agotado) o `1` (con stock). Sin fila, el producto no pertenece al menú de
la sucursal.

- Asignar o cambiar estado: `POST /api/menu/manage/products/{id}/stocks/` con
  `{branch_id, stock?}` (upsert; `stock` por defecto `-1`).
- Desasignar: `DELETE /api/menu/manage/products/{id}/stocks/?branch_id=X`.
- Acceso (RN-23): solo gerentes sobre sucursales `active=True` de sus propias
  empresas (`company.owner == user`); 404 si no; superusuario puede todo. El
  supervisor queda fuera del MVP (el seed no crea el grupo `supervisor`).
- En el menú (RF-08), el producto con fila de stock `!= 0` aparece como
  disponible; con stock `0` sigue visible pero marcado como "Agotado" y su
  pedido se bloquea (RN-24, `not_offered` = sin fila, `out_of_stock` = fila con
  stock 0).
