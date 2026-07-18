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

## Tareas

| Nombre | Descripción | Prioridad |
| --- | --- | --- |
| Diseño del Login | Pantalla que haga una llamada a la API | Alta |
| Endpoint de inicio de sesión | API que requiera el usuario y contraseña, y valide en la base de datos si está correcto. | Alta |
| Modelo de Usuario | Crear modelo del usuario en el backend | Alta |
| Persistencia de usuario | Opción para recordar las sesión | Baja |
| Redirección de usuario | Revisar qué tipo de usuario es y reenviarlo a la pantalla correspondiente | Alta |

🍌niado