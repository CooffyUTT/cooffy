# Matriz de Testing de Requerimientos

Esta matriz contiene escenarios que necesitan una decisión de contrato o un
punto de integración en producción antes de finalizar un test automatizado.
Está enfocada deliberadamente en los requerimientos: no debe actualizarse por
cada archivo o caso de prueba. Actualízala únicamente cuando cambie la
especificación, el alcance del MVP o un contrato pendiente de resolver.

La fuente de verdad es `docs/requerimientos.md`, `docs/mvp_1.md` y los
documentos detallados de RF en `docs/requeriments/`.

## Cómo Usarla

1. Lee el RF/RN referenciado y los requerimientos relacionados.
2. Resuelve las preguntas de contrato de la matriz antes de inventar
   assertions.
3. Agrega el test resultante en el nivel más bajo que sea adecuado.
4. Mantén los fallos de implementación trazables al RF/RN en el reporte de
   tests.
5. Elimina o modifica una fila únicamente cuando cambie la especificación o
   cuando la decisión se haya incorporado a la documentación de requerimientos.

Una fila sin resolver no autoriza a crear assertions sobre la implementación
actual. Es un elemento de traspaso para aclarar requerimientos o para la fase
de implementación.

Cuando un documento RF y la tabla global de RN utilicen identificadores
distintos para la misma regla, conserva ambas referencias en el reporte de
tests hasta reconciliar los requerimientos. No renumeres la regla en silencio.

## Decisiones de Contrato Pendientes

| ID | Fuentes | Escenario a proteger | Contrato o decisión necesaria | Nivel y punto de integración |
|---|---|---|---|---|
| RF-04-01 | RF-04, RN-23 | Un gerente/supervisor autorizado ve únicamente métricas de sucursales permitidas | Definir el alcance por rol y la respuesta cuando una sucursal no está autorizada | Integración API; endpoint/servicio del dashboard |
| RF-04-02 | RF-04 | Las ventas diarias, cantidad de pedidos, producto más vendido y tiempo promedio se calculan consistentemente | Definir qué estados de pago/pedido cuentan, la zona horaria y los timestamps usados para el tiempo de operación | Unitario más API; consulta/servicio de KPI |
| RF-04-03 | RF-04 | Los filtros semanal, mensual, cuatrimestral y semestral respetan sus límites | Definir fechas inclusivas, periodos calendario o móviles y resultados de periodos vacíos | Unitario más API; filtro/consulta de periodos |
| RF-04-04 | RF-04 | El dashboard se actualiza al cambiar el periodo seleccionado | Definir si se requiere refresh, polling u otro mecanismo y qué significa actualización reciente | Comportamiento frontend más contrato API |
| RF-07-01 | RF-07, RN-13 | Los pedidos avanzan por una secuencia lineal válida de estados | Definir valores canónicos, transiciones permitidas y respuesta de rechazo. Los documentos usan descripciones de tres y cuatro estados | Unitario más API; política de transiciones |
| RF-07-02 | RF-07, RN-16, RN-17 | El personal suspende y reanuda la recepción de pedidos de una sucursal | Definir el ajuste persistido, roles autorizados, endpoint/acción y respuesta durante la suspensión | Integración API; sucursal/creación de pedido |
| RF-07-03 | RF-07 | Las columnas de pedidos de cocina se actualizan sin refresh manual | Definir el mecanismo y la garantía de actualización: polling, server push o queries activadas por refresh | Integración frontend o E2E sólo si los niveles inferiores no bastan |
| RF-07-04 | RF-07, RN-22/RN-23/RN-24 | El personal administra sólo pedidos de sucursales autorizadas y los cambios son auditables | Reconciliar la numeración de RN y definir el campo/evento de auditoría y la relación rol-sucursal | Integración API; permisos y persistencia |
| RF-10-01 | RF-10, RN-04/RN-10 | Un cliente puede tener un pedido activo por sucursal | Definir estados activos y terminales, incluyendo si pedidos rechazados/cancelados cuentan | Integración API; restricción de creación |
| RF-10-03 | RF-10, RN-21 | El número de pedido es único por sucursal y fecha de operación | Definir generación concurrente y si la numeración se reinicia por sucursal/fecha | API más constraint/servicio de base de datos |
| RF-10-04 | RF-10 | El cliente recibe un resumen/comprobante después de crear el pedido | Definir campos de respuesta, identificador del comprobante, estado inicial y contrato de notificación | Integración API; respuesta/efectos secundarios |
| RF-11-01 | RF-11, RN-18 | El cliente selecciona un método de pago permitido | Definir enum de métodos y respuesta para un método inválido | Unitario más API; serializer |
| RF-11-02 | RF-11, RN-19 | El pago electrónico simulado cambia el estado sólo después de confirmarse | Definir éxito/fallo del mock y la operación que confirma el pago | Integración API; servicio de pagos |
| RF-11-03 | RF-11, RN-19 | El pago en efectivo permanece pendiente hasta que lo confirma caja | Definir rol de cajero, endpoint de confirmación, transición permitida y comportamiento al confirmar dos veces | Integración API; política de permisos/estado |
| RF-11-04 | RF-11, RN-20 | Un pedido pagado genera automáticamente un comprobante | Definir formato, persistencia, unicidad y si la generación es síncrona | Integración API; efecto secundario de pago/pedido |
| RF-12-01 | RF-12, RN-13 | El cliente ve el estado y detalles sólo de sus propios pedidos | Definir endpoint/respuesta para el cliente y valores canónicos de estado | Integración API; queryset/serializer |
| RF-12-02 | RF-12 | El cliente ve un tiempo estimado de preparación | Definir origen, unidad, cálculo y comportamiento cuando no existe estimación | Unitario más API/comportamiento frontend |
| RF-12-03 | RF-12 | El estado del cliente permanece sincronizado con los cambios de cocina | Definir mecanismo de actualización y retraso máximo aceptable antes de considerar los datos obsoletos | Contrato API; E2E sólo si es necesario |
| RF-14-01 | RF-14, RN-25/RN-26 | La recogida programada se valida contra la ventana de anticipación de la sucursal (mínimo 30 min y máximo hasta el final del día anterior) | Definir dónde se persisten los valores mín/máx, las unidades y la respuesta ante una recogida fuera de la ventana | Unitario más API; serializer/creación de pedido |
| RF-14-02 | RF-14, RN-27 | El gerente de la sucursal configura la ventana de anticipación | Definir campos en la sucursal, rol autorizado y endpoint de actualización | Integración API; sucursal |
| RF-14-03 | RF-14, RN-28 | Un pedido anticipado cuenta como pedido activo y bloquea otro pedido del cliente en la misma sucursal | Definir si la restricción de pedido activo considera pedidos programados a futuro y hasta qué estado | Integración API; restricción de creación |
| RF-14-04 | RF-14, RN-29 | El pedido anticipado entra a la cola de cocina únicamente cuando la recogida programada está próxima | Definir el momento exacto (criterio de tiempo) y el mecanismo para incorporarlo a la cola | Integración API; queryset de cocina |
| RF-14-05 | RF-14, RN-31 | El panel de cocina muestra una pestaña de pedidos anticipados pendientes | Definir endpoint, campos mostrados (hora de recogida, cliente, productos) y orden | Integración frontend/API; panel de cocina |
| RF-14-06 | RF-14, RN-30 | El cliente cancela un pedido anticipado dentro de la ventana y no se reactiva | Definir endpoint/acción de cancelación, rol, estado resultante y regla de no reactivación | Integración API; política de estados |

## Límite del MVP

El MVP excluye explícitamente el control de capacidad de producción por
cantidad. No crees tests para RN-10/RN-11 como fallos del MVP, salvo que cambie
el alcance del MVP. La disponibilidad del producto y el límite de unidades por
pedido son reglas distintas.
