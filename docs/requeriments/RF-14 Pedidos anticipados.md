# RF-14 Pedidos anticipados

Responsable: Neyzer
Prioridad: alta  
Actor: Cliente (Alumno)

## Descripción

El requerimiento funcional **RF-14 Pedidos anticipados** tiene como propósito permitir que un cliente registre un pedido con una fecha y hora de recogida programada, de manera que la cafetería pueda prepararlo sin que el cliente tenga que esperar en fila durante el receso.

Para cumplir con esta funcionalidad, el sistema deberá considerar los siguientes aspectos:

- **Registro con recogida programada:** Al confirmar el pedido, el cliente podrá indicar una fecha y hora de recogida (mismo día o días posteriores) dentro de la ventana de anticipación permitida por la sucursal.
- **Ventana de anticipación por sucursal:** Cada sucursal definirá la ventana en la que se aceptan pedidos anticipados, compuesta por una anticipación mínima (tiempo requerido para preparación, por defecto 30 minutos) y un límite máximo de anticipación (por defecto, hasta el final del día anterior a la recogida).
- **Configuración por el gerente:** El gerente de la sucursal podrá editar la ventana de anticipación (mínima y máxima) desde la gestión de la sucursal.
- **Validación del pedido:** El sistema validará que la recogida programada esté dentro de la ventana de anticipación y el horario de operación de la sucursal, además de las validaciones regulares de pedido (RF-10).
- **Preparación oportuna:** El pedido anticipado se incorporará a la cola de cocina el día de la recogida, cuando la hora programada esté próxima, para terminar su preparación a tiempo sin saturar la cola antes del receso.
- **Pestaña de pedidos anticipados en cocina:** El panel de cocina (RF-07) contará con una pestaña "Pedidos anticipados" que liste los pedidos con recogida programada a futuro que aún no se han incorporado a la cola de preparación, mostrando la hora de recogida, el cliente, los productos y el estado, para que el personal pueda planificar su preparación.
- **Pedido activo:** Un pedido anticipado cuenta como pedido activo de la sucursal, por lo que el cliente no podrá registrar otro pedido (ni normal ni anticipado) en la misma sucursal mientras este siga activo.
- **Cancelación anticipada:** El cliente podrá cancelar un pedido anticipado mientras este se encuentre dentro de la ventana de anticipación; una vez cancelado no podrá reactivarse.
- **Pago y seguimiento:** El pago se realizará como en cualquier pedido (RF-11) y el cliente podrá consultar su estado mediante RF-12.

## Flujo

1. El cliente consulta el menú y agrega productos a su carrito (RF-08, RF-09)
2. Al confirmar el pedido, el cliente selecciona la modalidad "Pedido anticipado" e indica fecha y hora de recogida
3. El sistema valida que la recogida esté dentro de la ventana de anticipación de la sucursal
4. El cliente selecciona el método de pago y confirma el pedido
5. El pedido se registra con estado inicial y recogida programada
6. El personal de cocina visualiza el pedido en la pestaña "Pedidos anticipados"
7. El día de la recogida, el pedido aparece en la cola de cocina cuando se acerca la hora programada
8. El cliente consulta el estado del pedido (RF-12) y recoge su comida a la hora programada

## Dependencias y restricciones

Depende de:

- RF-03 Gestión de sucursales (configuración de la ventana por el gerente)
- RF-08 Consulta del menú
- RF-09 Gestión del carrito
- RF-10 Registro de pedidos
- RF-11 Gestión de pagos
- RF-12 Consulta del estado del pedido

Restricciones:

- RN-25 Todo pedido anticipado deberá indicar la fecha y hora programada de recogida.
- RN-26 La recogida programada deberá estar dentro de la ventana de anticipación definida por la sucursal (por defecto: 30 minutos como mínimo y hasta el final del día anterior como máximo).
- RN-27 El gerente de la sucursal podrá configurar la ventana de anticipación de pedidos anticipados.
- RN-28 Un pedido anticipado cuenta como pedido activo de la sucursal para efectos de RN-04.
- RN-29 Un pedido anticipado aparecerá en la cola de cocina únicamente cuando la recogida programada esté próxima.
- RN-30 El cliente podrá cancelar un pedido anticipado mientras esté dentro de la ventana de anticipación; un pedido cancelado no podrá reactivarse.
- RN-31 El panel de cocina mostrará una pestaña de pedidos anticipados con los pedidos programados a futuro y aún no incorporados a la cola de preparación.
