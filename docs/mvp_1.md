# MVP - Cuatri 1

El MVP (_Minimum Viable Product_) es lo mínimo que tiene que tener el sistema para que funcione, y eso mismo es lo que presentaremos al final del cuatrimestre, aproximadamente el **Agosto 11 - 12**.

A partir de los [**requerimientos funcionales**](requerimientos.md) se definieron los siguientes requerimientos mínimos:

| Funcionalidad | RF | Descripción |
|---|---|---|
| **Autenticación de usuarios** | RF-01 | • Inicio de sesión mediante usuario y contraseña.<br>• Control de acceso según el rol del usuario.<br>• Redirección al panel correspondiente.<br><br>Todos los actores del sistema deberán autenticarse para acceder a sus funcionalidades. |
| **Panel del cliente** | RF-08, RF-09, RF-10, RF-11, RF-12 | • Consulta del menú de productos.<br>• Visualización del detalle de los productos.<br>• Gestión del carrito de compra.<br>• Confirmación del pedido.<br>• Selección del método de pago.<br>• Consulta del estado del pedido.<br><br>El cliente podrá completar el proceso de compra desde un único panel. |
| **Panel de operación** | RF-07 | • Visualización de pedidos activos.<br>• Cambio del estado de los pedidos.<br>• Consulta del historial o resumen de pedidos del día.<br>• Pestaña de pedidos anticipados con los pedidos programados a futuro. |
| **Panel del supervisor** | RF-02, RF-05 | • Gestión de empleados.<br>• Gestión del menú.<br>• Configuración básica de la sucursal.<br>• Consulta del resumen diario de operación.<br><br>La administración se limitará a la sucursal asignada al supervisor. |
| **Gestión de sucursales** | RF-03 | • Administración de una única sucursal por gerente.<br><br>Aunque la arquitectura contempla múltiples sucursales, el MVP permitirá gestionar únicamente una sucursal por gerente para reducir la complejidad inicial. |
| **Gestión de pagos** | RF-11 | • Pago en efectivo.<br>• Pago con tarjeta.<br>• Registro del estado del pago.<br>• Generación del comprobante del pedido.<br><br>El pago con tarjeta podrá implementarse inicialmente como una simulación, sin integración con una pasarela de pago. |
| **Disponibilidad del menú** | RF-06 | • Marcar productos como disponibles o no disponibles.<br>• Bloqueo de productos no disponibles para nuevos pedidos.<br><br>El control de disponibilidad será binario ("Disponible / No disponible"). No se implementará control de inventario por cantidades ni capacidad máxima de producción durante el MVP. |
| **Despliegue** | — | • Publicación del sistema en Internet.<br><br>El sistema deberá ser accesible mediante una URL pública para permitir las pruebas y demostración del proyecto. |
| **Aplicación web responsiva** | — | • Compatibilidad con computadoras.<br>• Compatibilidad con tabletas.<br>• Compatibilidad con teléfonos móviles.<br><br>Toda la aplicación será desarrollada como una plataforma web responsiva, sin requerir instalación por parte del usuario. |
| **Pedidos anticipados** | RF-14 | • Registro de pedidos con fecha y hora de recogida programada (mismo día o días posteriores).<br>• Ventana de anticipación por sucursal: mínimo 30 minutos y máximo hasta el final del día anterior, configurable por el gerente.<br>• El pedido anticipado entra a la cola de cocina el día de la recogida.<br>• Cuenta como pedido activo y puede cancelarse dentro de la ventana de anticipación.<br><br>El cliente agendará su comida antes del receso y la recogerá sin hacer fila. |
