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

## Tareas

| Nombre | Descripción | Prioridad |
|--------|-------------|-----------|
| Creación de los modelos en el backend | - Crear el modelo `Usuario` y los campos necesarios para identificar su rol dentro del sistema.<br>- Configurar el Custom User Model | Alta |
| Implementar los serializadores | Crear las clases que representen especificamente los campos de cada tabla que se creará en la BD. | Alta |
| Endpoint para alta de clientes | - Crear el endpoint que permita registrarse en la aplicación.<br>- Validar que el correo pertenezca al dominio autorizado por la escuela seleccionada. | Alta |
| Endpoint para consulta de usuarios | Permitir obtener la información de los usuarios registrados según su rol (Aplica solo para gerente y clientes). | Media-Baja |
| Validación de contraseñas | Almacenar de manera segura las contraseñas en la BD con ayuda de Django | Alta |
| Interfaz para regristro del usuario cliente | Pantalla inicial del usuario cliente al entrar a la app. Esta interfaz le va a permitir a los clientes registrarse en el sistema para empezar a realizar pedidos, por lo que una vez registrado el sistema lo va a redirigir a la pagina de inicio (menú). | Alta |