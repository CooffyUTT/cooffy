# RF-03 Gestión de sucursales

Responsable: @Andrés Cuevas

Prioridad: Media  
Actor: Gerente

## Descripción

El gerente entra a un menú donde puede ver sus sucursales. Aquí puede editar la información de cada sucursal. Es necesario que el gerente primero compre su membresía de Cooffy, dé de alta su empresa, vaya a la escuela, que el admin de la escuela dé de alta la universidad con correos institucionales y sucursal, para que por fin pueda configurar sus sucursales.

## Flujo

1. Gerente inicia sesión
2. Gerente va al menú de sucursales
3. Se muestra la pantalla de sucursales
4. Aquí puede ver o editar información de una sucursal

## Dependencias y restricciones

Depende de:

- RF-01 Autenticación de usuarios.

Restricciones:

- RN-22 Los cambios realizados sobre usuarios, sucursales, productos y pedidos deberán registrar la fecha y hora de la última modificación.
- RN-23 Un usuario únicamente podrá administrar la información correspondiente a las sucursales para las que tenga autorización.

## Tareas

| Nombre | Descripción | Prioridad |
| --- | --- | --- |
| Opción Sucursal | Agregar opción “Sucursal“ al menú del gerente | Alta |
| Pantalla Sucursal | Pantalla que muestra la sucursal asignada al gerente | Alta |
| GET Sucursal | Endpoint GET que requiera el ID de la empresa (que lo indicará el gerente) para mostrar la sucursal con su información | Alta |
| Editar Sucursal | Botón Editar en el contenedor de la sucursal que habilite la edición de los campos. Cambiar el botón Editar por Guardar | Media |
| POST Sucursal | Endpoint POST que cambie los datos de la sucursal en la base de datos. | Media |