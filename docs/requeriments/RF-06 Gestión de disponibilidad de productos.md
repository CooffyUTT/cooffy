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

## Tareas

| Nombre | Descripción | Prioridad |
| --- | --- | --- |
| Campo para editar limite | Campo en backend y frontend para editar el limite por producto en formulario de alta | media |
| Botón de agotado | Botón para marcar como agotado un producto y se actualicé en base de datos | media |
| Validación de productos agotados | Impedir que un cliente pueda añadir al carrito y comprar un producto agotado | media |
| Mostrar productos agotados | Mostrar al usuario explicitamente que un producto está agotado | media |
| Validación de limite por producto | Validar en backend y frontend que en el pedido no exceda el limite | media |