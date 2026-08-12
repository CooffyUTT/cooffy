# Requerimientos y Restricciones

# Actores

| Nombre | Necesidad | Descripción |
| --- | --- | --- |
| Clientes | Consumir dentro de la escuela | Son todos aquellos alumnos, profesores y cualquier otro personal que consumen dentro de comedores escolares. |
| Empleados | Realizar los pedidos. | Cajeros, cocineros o cualquier empleado de operación que está de lleno en hacer los pedidos de los clientes. |
| Supervisores | Gestionar sucursal única | Encargado de supervisar y gestionar la operación de una sucursal. |
| Gerentes | Gestionar todo el negocio | Encargado o dueño de una o muchas sucursales. |
| Admin Escolar | Gestionar tiendas en su escuela | Encargado de gestionar las sucursales de su escuela, y configuración de las cuentas de los alumnos. |

# Requerimientos

## Funcionales (RF)

Ciertos requisitos son detallados en [Requerimientos](requeriments/)

| ID  | Actor | Funcionalidad |
| --- | --- | --- |
| RF-01 | Todos | Autenticación de usuarios |
| RF-02 | Gerente | Gestión de usuarios |
| RF-03 | Gerente | Gestión de sucursales |
| RF-04 | Gerente y Supervisor | Dashboard e indicadores |
| RF-05 | Gerente y Supervisor | Gestión del menú |
| RF-06 | Gerente y Supervisor | Gestión de disponibilidad de productos |
| RF-07 | Supervisor y Empleados | Gestión de pedidos |
| RF-08 | Cliente | Consulta del menú |
| RF-09 | Cliente | Gestión del carrito |
| RF-10 | Cliente | Registro de pedidos |
| RF-11 | Cliente | Gestión de pagos |
| RF-12 | Cliente | Consulta del estado del pedido |
| RF-13 | Admin Escolar | Gestionar sucursales de una escuela |
| RF-14 | Cliente | Pedidos anticipados |

## No Funcionales (RNF)

| ID  | Categoría | Requerimiento |
| --- | --- | --- |
| RNF-01 | Rendimiento | El menú deberá mostrarse en menos de 2 segundos en una conexión estable. |
| RNF-02 | Disponibilidad | El sistema deberá estar disponible durante el horario de operación de la cafetería, salvo mantenimientos programados. |
| RNF-03 | Compatibilidad | El sistema deberá funcionar correctamente en navegadores modernos y dispositivos móviles. |
| RNF-04 | Seguridad | Las contraseñas deberán almacenarse utilizando un algoritmo de hash seguro. |
| RNF-05 | Usabilidad | El cliente deberá poder completar un pedido en un máximo de cinco pasos. |

# Reglas de negocio (RN)

Restricciones especificas

| Regla | Requerimiento | Descripción | Justificación |
| --- | --- | --- | --- |
| RN-01 | RF-01 | Cada usuario deberá autenticarse antes de acceder al sistema. | Proteger el acceso a la información y funcionalidades. |
| RN-02 | RF-01 | Cada usuario tendrá uno o más roles asignados que determinarán las acciones que puede realizar dentro del sistema. | Controlar el acceso según responsabilidades. |
| RN-03 | RF-01 | Los clientes utilizarán sus credenciales institucionales para iniciar sesión. | Evitar cuentas duplicadas y aprovechar la identidad institucional. |
| RN-04 | RF-10 | Un cliente únicamente podrá tener un pedido activo por sucursal al mismo tiempo. | Evitar la saturación de pedidos por un mismo usuario. |
| RN-05 | RF-10 | Un pedido no podrá modificarse una vez confirmado. | Garantizar estabilidad durante la preparación del pedido. |
| RN-06 | RF-10 | Todo pedido deberá pertenecer a una única sucursal. | Facilitar la operación independiente de cada cafetería. |
| RN-07 | RF-09, RF-10 | Todo pedido deberá tener al menos un producto. | Evitar pedidos inválidos. |
| RN-08 | RF-05, RF-08 | Un producto deshabilitado no podrá agregarse a nuevos pedidos ni mostrarse como disponible en el menú. | Evitar vender productos fuera de disponibilidad. |
| RN-09 | RF-05 | Un producto podrá marcarse como promoción únicamente mientras permanezca activo. | Evitar promociones sobre productos no disponibles. |
| RN-10 | RF-06 | Cada producto podrá definir un límite máximo de producción para un periodo determinado. | Controlar la capacidad operativa de cocina. |
| RN-11 | RF-06 | Cuando un producto alcance su capacidad máxima de producción dejará de estar disponible para nuevos pedidos. | Evitar vender más productos de los que pueden prepararse. |
| RN-12 | RF-06, RF-09 | Cada producto podrá definir un límite máximo de unidades por pedido. | Evitar compras excesivas de un solo producto. |
| RN-13 | RF-07, RF-12 | Los pedidos seguirán únicamente la secuencia de estados definida por el sistema. | Mantener un flujo consistente de operación. |
| RN-14 | RF-07 | Un pedido rechazado no podrá volver a aceptarse. | Evitar inconsistencias en el flujo de trabajo. |
| RN-15 | RF-07 | Un pedido entregado no podrá volver a cambiar de estado. | Preservar la integridad del historial. |
| RN-16 | RF-07 | La recepción de pedidos podrá suspenderse temporalmente por sucursal. | Permitir controlar la carga de trabajo durante periodos críticos. |
| RN-17 | RF-07, RF-10 | Mientras una sucursal tenga suspendida la recepción de pedidos, no podrán registrarse nuevos pedidos. | Evitar sobrecargar la operación. |
| RN-18 | RF-11 | Todo pedido deberá registrar el método de pago seleccionado por el cliente. | Llevar control financiero de las ventas. |
| RN-19 | RF-11 | Un pedido únicamente podrá marcarse como pagado una vez confirmado el pago correspondiente. | Garantizar consistencia entre pedidos y pagos. |
| RN-20 | RF-11 | Todo pedido pagado generará automáticamente un comprobante de compra. | Facilitar la identificación y entrega del pedido. |
| RN-21 | RF-10 | El número de pedido deberá ser único dentro de cada sucursal y fecha de operación. | Permitir identificar pedidos sin ambigüedad. |
| RN-22 | RF-02, RF-03, RF-05, RF-07 | Los cambios realizados sobre usuarios, sucursales, productos y pedidos deberán registrar la fecha y hora de la última modificación. | Facilitar auditoría y trazabilidad de la información. |
| RN-23 | RF-02, RF-03, RF-04, RF-05, RF-07 | Un usuario únicamente podrá administrar la información correspondiente a las sucursales para las que tenga autorización. | Proteger la información entre sucursales. |
| RN-24 | RF-10 | Los pedidos únicamente podrán contener productos pertenecientes a la misma sucursal donde fueron realizados. | Evitar pedidos con productos de distintas sucursales. |
| RN-25 | RF-14 | Todo pedido anticipado deberá indicar la fecha y hora programada de recogida. | Permitir preparación y entrega planificada. |
| RN-26 | RF-14 | La recogida programada deberá estar dentro de la ventana de anticipación definida por la sucursal (por defecto: mínimo 30 minutos y máximo hasta el final del día anterior). | Asegurar tiempos de preparación y operación. |
| RN-27 | RF-14 | El gerente de la sucursal podrá configurar la ventana de anticipación de pedidos anticipados. | Adecuar la política a cada comedor escolar. |
| RN-28 | RF-14 | Un pedido anticipado cuenta como pedido activo de la sucursal para efectos de RN-04. | Evitar saturación por un mismo cliente. |
| RN-29 | RF-14 | Un pedido anticipado aparecerá en la cola de cocina únicamente cuando la recogida programada esté próxima. | Evitar saturar la cola de cocina. |
| RN-30 | RF-14 | El cliente podrá cancelar un pedido anticipado mientras esté dentro de la ventana de anticipación; un pedido cancelado no podrá reactivarse. | Flexibilidad para el cliente sin afectar la operación. |
| RN-31 | RF-14 | El panel de cocina mostrará una pestaña de pedidos anticipados con los pedidos programados a futuro y aún no incorporados a la cola de preparación. | Permitir planificar la preparación. |