// Hook personalizado que centraliza toda la lógica del formulario de inicio de sesión.
// Se encarga del estado del formulario, la visibilidad de la contraseña
// y las acciones relacionadas con el proceso de autenticación.

import { useState } from 'react';
import { LoginCredentials } from '@/types/auth';
import { toast } from 'sonner';

interface FormErrors {
  credentials?: string;
  password?: string;
}

export function useLoginForm() {

  // Estado que controla si la contraseña se muestra en texto plano
  // o permanece oculta dentro del campo de entrada.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  // Estado que almacena los datos ingresados por el usuario.
  // Required<LoginCredentials> asegura que todas las propiedades
  // definidas en la interfaz siempre existan.
  const [formData, setFormData] = useState<Required<LoginCredentials>>({
    credentials: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Alterna entre mostrar y ocultar la contraseña.
  const togglePasswordVisibility = () =>
    setPasswordVisible((prev) => !prev);

  // Función interna para validar campos de forma individual
  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return "Este campo es requerido.";
    }

    if (name === 'credentials') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Introduce un correo electrónico válido.";
      }
    }

    if (name === 'password') {
      if (value.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
    }

    return "";
  };

  // Actualiza dinámicamente el estado del formulario cada vez
  // que el usuario modifica un campo de entrada.
  // El atributo "name" del input determina qué propiedad será actualizada.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // Maneja el envío del formulario utilizando credenciales tradicionales
  // (correo institucional o matrícula y contraseña).
  // Se evita el comportamiento por defecto del navegador para controlar
  // el proceso mediante React.
  const handleCredentialsLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
   e.preventDefault();
    if (isLoading) return; // Evita envíos dobles si ya está cargando

    const credentialsError = validateField('credentials', formData.credentials);
    const passwordError = validateField('password', formData.password);

    if (credentialsError || passwordError) {
      setErrors({ credentials: credentialsError, password: passwordError });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Enviando credenciales...', formData);
      
      // Simulación de petición a API de 2 segundos (Reemplazar por tu servicio real)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (formData.password.length < 6) {
        toast.error("Error de autenticación", {
          description: "El usuario o la contraseña introducidos no coinciden con nuestros registros.",
        });
        return;
      }
      
      console.log('Login exitoso');
    } catch (error) {
      console.error('Error en el login', error);
      // 2. SIMULACIÓN: Error del Servidor
      toast.error("Error del sistema", {
        description: "Hubo un problema al conectar con el servidor. Inténtalo de nuevo.",
      });
    } finally {
      // Importante: Volver a false para desbloquear el botón
      setIsLoading(false); 
    }
    // Aquí deberá integrarse posteriormente la llamada al servicio
    // de autenticación encargado de validar las credenciales.
    // Ejemplo:
    // await authService.login(formData);
  };

  // Punto de entrada para la autenticación mediante Single Sign-On (SSO).
  // Posteriormente aquí se integrará el proveedor institucional
  // (OAuth, Azure AD, Google Workspace, etc.).
  const handleSSOLogin = () => {
    console.log('Iniciando flujo SSO Institucional');
    // 3. SIMULACIÓN: Cancelación de Google (Toast informativo/advertencia)
    toast.warning("Autenticación externa", {
      description: "El inicio de sesión con Google se ha cancelado.",
    });
  };

  // Helper dinámico para saber si un campo es totalmente válido (para los iconos)
  const isFieldValid = (name: 'credentials' | 'password') => {
    return formData[name].length > 0 && !errors[name];
  };

  // Se exponen únicamente los estados y funciones que serán utilizados
  // por los componentes que consuman este hook.
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