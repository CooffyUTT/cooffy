// Hook personalizado que centraliza toda la lógica del formulario de inicio de sesión.
// Se encarga del estado del formulario, la visibilidad de la contraseña
// y las acciones relacionadas con el proceso de autenticación.

import { useState } from 'react';
import { LoginCredentials } from '@/types/auth'; // Interfaz que define la estructura base del login (credentials, password)
import { toast } from 'sonner';

// Interfaz para el manejo de mensajes de error específicos por campo
interface FormErrors {
  user?: string;
  password?: string;
}

export function useLoginForm() {

  // --- ESTADOS DEL HOOK ---
  
  // Controla el estado visual de carga (loading) para deshabilitar botones y evitar peticiones duplicadas[cite: 2]
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Estado que controla si la contraseña se muestra en texto plano o permanece oculta[cite: 2]
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  // Estado que almacena los datos ingresados por el usuario.
  // Required<LoginCredentials> obliga a que todas las propiedades opcionales del tipo original sean obligatorias aquí[cite: 2].
  const [formData, setFormData] = useState<Required<LoginCredentials>>({
    user: '',
    password: '',
  });
  
  // Almacena los strings de error arrojados por la validación[cite: 2]
  const [errors, setErrors] = useState<FormErrors>({});

  // --- MANEJADORES VISUALES Y HELPERS ---

  // Alterna el flag booleano para cambiar el tipo de input entre 'password' y 'text'[cite: 2]
  const togglePasswordVisibility = () =>
    setPasswordVisible((prev) => !prev);

  /**
   * Validador puro y centralizado por campo.
   * @param name Nombre del campo a validar ('user' | 'password')
   * @param value Valor actual del campo
   * @returns Un string con el mensaje de error o un string vacío si es válido[cite: 2]
   */
  const validateField = (name: string, value: string): string => {
    // Validación común: Campo vacío o lleno de espacios en blanco
    if (!value.trim()) {
      return "Este campo es requerido.";
    }

    // Reglas de negocio para el usuario/correo institucional
    if (name === 'user') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular estándar para emails
      if (!emailRegex.test(value)) {
        return "Introduce un correo electrónico válido.";
      }
    }

    // Reglas de negocio para la contraseña (Límite mínimo de seguridad)
    if (name === 'password') {
      if (value.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
    }

    return "";
  };

  /**
   * Manejador de cambio dinámico (Controlled Component).
   * Actualiza el estado del formulario y ejecuta la validación *en tiempo real* a medida que el usuario escribe.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Actualización inmutable del estado del formulario[cite: 2]
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validación sobre la marcha (Real-time feedback)[cite: 2]
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  /**
   * Procesamiento del envío del formulario (Método Tradicional).
   * Ejecuta validaciones previas al envío y gestiona el flujo asíncrono con el servidor.
   */
  const handleCredentialsLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault(); // Detiene la recarga de página por defecto del navegador[cite: 2]
    if (isLoading) return; // Guard clause: Evita llamadas concurrentes si ya hay una petición en curso[cite: 2]

    // Forzar validación final de todos los campos antes de disparar la petición[cite: 2]
    const credentialsError = validateField('user', formData.user);
    const passwordError = validateField('password', formData.password);

    // Si existe algún error en el cliente, frena el flujo y actualiza el estado de errores[cite: 2]
    if (credentialsError || passwordError) {
      setErrors({ user: credentialsError, password: passwordError });
      return;
    }

    setIsLoading(true); // Bloquea la UI (ej. loaders en botones)[cite: 2]

    try {
      console.log('Enviando credenciales...', formData);
      
      // TODO: REEMPLAZAR ESTE BLOQUE POR LA LLAMADA AL SERVICIO DE AUTENTICACIÓN REAL
      // Simulación de latencia de red de 2 segundos[cite: 2]
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Control simulado para contraseñas inválidas que pasaron el filtro inicial pero fallan en el servidor
      if (formData.password.length < 6) {
        toast.error("Error de autenticación", {
          description: "El usuario o la contraseña introducidos no coinciden con nuestros registros.",
        });
        return;
      }
      
      console.log('Login exitoso');
      // NOTA: Aquí se debería redirigir al usuario (ej. router.push('/dashboard')) o guardar el token de sesión.
    } catch (error) {
      console.error('Error en el login', error);
      // Captura fallos de red, caídas de servidor (500 status codes), etc.[cite: 2]
      toast.error("Error del sistema", {
        description: "Hubo un problema al conectar con el servidor. Inténtalo de nuevo.",
      });
    } finally {
      // Garantiza que la UI se desbloquee sin importar si la petición fue exitosa o fallida[cite: 2]
      setIsLoading(false); 
    }
  };

  /**
   * Flujo secundario: Autenticación federada de una sola firma (SSO).
   * Diseñado para integraciones futuras con OAuth2, Azure AD, o Google Workspace[cite: 2].
   */
  const handleSSOLogin = () => {
    console.log('Iniciando flujo SSO Institucional');
    // Simulación actual: Avisa al usuario que el flujo interactivo fue cancelado o no completado[cite: 2]
    toast.warning("Autenticación externa", {
      description: "El inicio de sesión con Google se ha cancelado.",
    });
  };

  /**
   * Helper dinámico útil para la UI. Permite renderizar elementos visuales en tiempo real
   * (como un checkmark verde de validación al lado de los inputs)[cite: 2].
   */
  const isFieldValid = (name: 'user' | 'password') => {
    return formData[name].length > 0 && !errors[name];
  };

  // API pública del Hook: Solo se expone lo necesario para el componente consumidor (LoginForm)[cite: 2]
  return {
    formData,
    errors,
    isLoading,
    passwordVisible,
    isFieldValid,
    togglePasswordVisibility,
    handleInputChange,
    handleCredentialsLogin,
    handleSSOLogin,
  };
}