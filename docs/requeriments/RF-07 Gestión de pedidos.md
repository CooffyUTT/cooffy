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
