# RF-04 Dashboard e indicadores

Responsable: @Neyzer

Prioridad: baja  
Actor: Gerente/Supervisor

:::info
Esta extenso porque tenia que definir KPI’s xd
:::

## Descripción

Los gerentes y supervisores podrán ver estadísticas de la sucursal. Esto incluye indicadores (KPI’s) relacionados con:

1. Ventas / Dinero generado
2. Cantidad de pedidos hechos
3. Productos pedidos
4. Tiempo de operación

Con estos KPI’s, se pueden definir los siguientes Dashboards:

1. Resumen del día
  1. Ventas del día
  2. Producto más vendido
  3. Cantidad de pedidos
  4. Promedio de tiempo de operación
2. Top de productos
3. Cantidad de pedidios por hora
4. Cantidad de venta generada
5. Gráfica de tiempos de operación

Se podrá filtrar por periodos, como:

- Semanal
- Mensual
- Cuatrimestral
- Semestral

## Flujo

1. Gerente inicia sesión
2. Se dirige a la pestaña de dashboard
3. Ve el resumen diario al inicio
4. Desliza y ve más métricas por periodo
5. El gerente cambia el periodo y las gráficas se actualizan

## Dependencias y Restricciones

Depende de:

- RF-01: Autenticación de usuarios

Restricciones:

- RN-23: Un usuario únicamente podrá administrar la información correspondiente a las sucursales para las que tenga autorización.
