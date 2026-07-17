# RF-07 Gestión de pedidos

Responsable: @Andrés Cuevas

Prioridad: Media  
Actor: Supervisor y Empleados (para MVP: Gerente y Empleados)

## Descripción

El personal de cocina tendrá la opción “Pedidos” para ver todos los pedidos realizados por los clientes.

Estos pedidos se organizan en 3 columnas (en espera, en proceso y completados) de forma cronológica y actualizándose automáticamente sin que el personal tenga que refrescar la página.

Un pedido puede cambiar al siguiente estado presionando un botón hasta que llegue a “completados”.

Si hay muchos pedidos acumulados en espera, el personal puede desactivar la entrada de pedidos con un botón.

## Flujo

1. El gerente o empleado inicia sesión
2. El usuario va a la opción de pedidos
3. Aquí se muestran todos los pedidos que hay en espera, en proceso y terminados
4. El usuario puede cambiar de estado el pedido con un botón de forma lineal
5. Opción para alternar entre “Aceptar pedidos” y “Detener pedidos”

## Dependencias y restricciones

Depende de:

- RF-01 Autenticación de usuarios
- RF-02 Gestión de usuarios
- RF-03 Gestión de sucursales
- RF-07 Gestión de menú

Restricciones:

- RN-13 Los pedidos seguirán únicamente la secuencia de estados definida por el sistema.
- RN-14 Un pedido rechazado no podrá volver a aceptarse.
- RN-15 Un pedido entregado no podrá volver a cambiar de estado.
- RN-16 La recepción de pedidos podrá suspenderse temporalmente por sucursal.
- RN-17 Mientras una sucursal tenga suspendida la recepción de pedidos, no podrán registrarse nuevos pedidos.
- RN-23 Los cambios realizados sobre usuarios, sucursales, productos y pedidos deberán registrar la fecha y hora de la última modificación.
- RN-24 Un usuario únicamente podrá administrar la información correspondiente a las sucursales para las que tenga autorización.

## Tareas

| Nombre | Descripción | Prioridad |
| --- | --- | --- |
| Opción Pedidos | Agregar opción “Pedidos“ al menú del gerente | Alta |
| Pantalla Pedidos | Pantalla que muestra los estados en los que puede estar un pedido y los pedidos que hay en esos estados ordenados del más viejo al más nuevo | Alta |
| GET Pedidos | Endpoint GET para obtener todos los pedidos del día | Alta |
| GET Pedidos con Filtro | Endpoint de Pedidos con la opción de filtrar por Estado | Alta |
| Función Refresh | La página de Pedidos solicita el GET Pedidos cada segundo para mantener los estados actualizados | Media |
| Mover Pedido | Botón en el pedido para cambiarlo de estado | Alta |
| POST Pedido | Endpoint POST que cambie el estado del pedido | Alta |
| Aceptar/Detener Pedidos | Botón que permita aceptar o detener la entrada de pedidos | Baja |
| GET EstadoSucursal | Endpoint GET para saber el estado de la sucursal y poder definir el texto y color del botón  Si el estado actual es TRUE, el botón dirá “Detener Pedidos“ y será rojo. Si el estado es False, el botón dirá “Aceptar Pedidos” y será verde (o color Cooffy, no sé XD) | Baja |
| POST EstadoSucursal | Endpoint POST para alternar el campo “active” de una Sucursal entre TRUE o FALSE.  Este Endpoint requiere el ID de Sucursal | Baja |