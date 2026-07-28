# RF-01 Autenticación de usuarios

Responsable: @Andrés Cuevas

Prioridad: Alta  
Actor: Todos

## Descripción

El sistema permitirá autenticar a los usuarios mediante sus credenciales y conceder acceso únicamente a las funcionalidades correspondientes a su rol.

## Flujo

1. El usuario entra al Login
2. Ingresa su usuario y contraseña
3. Le da click al botón de “Iniciar sesión”
4. El sistema valida que el usuario esté registrado y que la contraseña sea correcta
5. Si el usuario es válido, lo redirecciona a x pantalla dependiendo del tipo de usuario
6. Si el usuario es inválido, se le indica que el usuario o contraseña son incorrectos

## Dependencias y restricciones

Depende de:

- RF-02 Gestión de usuarios

Restricciones:

- RN-01 Cada usuario deberá autenticarse antes de acceder al sistema.
- RN-02 Cada usuario tendrá uno o más roles asignados que determinarán las acciones que puede realizar dentro del sistema.
- RN-03 Los clientes utilizarán sus credenciales institucionales para iniciar sesión.
