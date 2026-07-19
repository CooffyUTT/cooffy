/**
 * @fileauth.ts (o el archivo de tipos correspondiente)
 * @description Interfaz que define la estructura de datos requerida para el proceso de autenticación.
 * 
 * Se utiliza principalmente en componentes de formulario (LoginForm), hooks personalizados (useLoginForm)
 * y servicios de API de autenticación para asegurar el tipado estático y evitar errores en tiempo de desarrollo.
 */

export interface LoginCredentials {
  /**
   * Identificador único proporcionado por el usuario para iniciar sesión.
   * 
   * @notes
   * - El signo `?` indica que la propiedad es **opcional** en el objeto base inicial.
   * - En este flujo particular, acepta tanto el **correo institucional** como la **matrícula** del usuario.
   * - Al consumirse dentro de un estado del formulario (ej. mediante `Required<LoginCredentials>`),
   *   este campo pasa a ser obligatorio antes de procesar el envío.
   */
  credentials?: string;

  /**
   * Clave secreta o frase de acceso asociada a la cuenta del usuario.
   * 
   * @notes
   * - Propiedad **opcional** (`?`) para permitir inicializaciones de estado vacías en formularios.
   * - Su contenido viaja en texto plano hacia el hook/servicio, donde se valida que cumpla con 
   *   los requisitos mínimos de seguridad (como la longitud de caracteres) antes de enviarse encriptado a la API.
   */
  password?: string;
}