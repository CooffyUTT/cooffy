# RF-02 Gestión de usuarios

Responsable: @Genesis

Prioridad: Alta
Actor: Todos

## Descripción

Funcionalidad que permite crear y administrar los usuarios supervisores, empleados y clientes.

## Precondiciones

- El usuario gerente debe existir en el sistema (creado por cooffy).
- El usuario administrador de escuela debe existir en el sistema (creado por cooffy).

## Flujo (MVP)

1. La empresa ‘Cooffy’ le brinda un usuario al gerente que adquirió el servicio.
2. La empresa ‘Cooffy’ le brinda un usuario a un admin. de escuela
3. El supervisor crea todos los usuarios “Empleado” que necesite (ayudantes en cocina).
4. Los usuarios clientes se registran por medio de:
1. Correo institucional
1. La validación principal en este registro es que la dirección de correo pertenezca al dominio establecido por el
admin. de escuela.
1. Ejemplo: **_@ut-tijuana.edu.mx_**
5. Escuela (seleccionable)
6. Contraseña

## Dependencias y restricciones

Depende de:

- [RF-01 Autenticación de usuarios](RF-01%20Autenticaci%C3%B3n%20de%20usuarios.md)
