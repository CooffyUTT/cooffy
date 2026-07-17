# RF-13 Gestionar sucursales de una escuela

Responsable: @Neyzer

Prioridad: Media  
Actor: Administrador escolar

## Descripción

Un administrador escolar podrá dar de alta, editar y dar de baja sucursales/tiendas de su escuela y asignarle un gerente.

## Flujo

1. Administrador escolar inicia sesión en su cuenta
2. Mira su panel principal
3. Da de alta una sucursal, con un gerente asignado y la información básica de la sucursal
4. Regresando a su panel principal, ve la lista de todas las sucursales de su escuela, clasificados por gerente
5. Al presionar una sucursal, ve los detalles de la sucursal
6. Edita la información básica de una sucursal
7. Da de baja a una sucursal (soft delete)

## Dependencias y restricciones

Depende de:

- RF-01 Inicio de sesión
- RF-03 Gestión de sucursales

Restricciones:

- RN-22 Los cambios realizados sobre usuarios, sucursales, productos y pedidos deberán registrar la fecha y hora de la última modificación.
- RN-23 Un usuario únicamente podrá administrar la información correspondiente a las sucursales para las que tenga autorización.

## Tareas

| Nombre | Descripción | Prioridad |
| --- | --- | --- |
| Endpoint para gestionar gerentes por sucursal | Endpoints en el backend para CRUD de sucursales de tienda de la escuela asignada al admin | Media |
| Panel de admin escolar | Diseño de pantalla de admin sin funcionalidad | Media |
| CRUD de sucursales por escuela | Admin podrá gestionar los usuarios desde la interfaz | Media |