// Hook personalizado que centraliza toda la lógica del formulario de inicio de sesión.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 👈 1. Import de Next.js Router
import { LoginCredentials } from '@/types/auth';
import { toast } from 'sonner';
import { api } from "@/lib/api";
import axios, { AxiosError } from 'axios'; // 👈 Asegúrate de importar AxiosError

interface FormErrors {
  user?: string;
  password?: string;
}

export function useLoginForm() {
  const router = useRouter(); // 👈 Instancia del router para redirección

  // --- ESTADOS DEL HOOK ---
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const [formData, setFormData] = useState<Required<LoginCredentials>>({
    user: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // --- MANEJADORES VISUALES Y HELPERS ---
  const togglePasswordVisibility = () =>
    setPasswordVisible((prev) => !prev);

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return "Este campo es requerido.";
    }

    // 👈 2. Ajuste: Permitir tanto nombres de usuario como correos
    if (name === 'password') {
      if (value.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
    }

    return "";
  };

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

  /**
   * Procesamiento del envío del formulario
   */
  const handleCredentialsLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault(); // Detiene la recarga de página por defecto
    if (isLoading) return; // Evita llamadas concurrentes si ya hay una petición en curso[cite: 6]

    // Validar campos localmente antes de enviar[cite: 6]
    const credentialsError = validateField('user', formData.user);
    const passwordError = validateField('password', formData.password);

    if (credentialsError || passwordError) {
      setErrors({ user: credentialsError, password: passwordError });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Petición POST usando tu instancia Axios 'api'
      // Automáticamente usará la baseURL de tu variable de entorno (process.env.NEXT_PUBLIC_API_URL)
      const response = await api.post('/api/auth/login/', {
        user: formData.user,
        password: formData.password,
      });

      // Axios almacena el body devuelto por Django directamente en response.data
      const data = response.data;

      // 2. Guardar Tokens y Usuario en LocalStorage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('userData', JSON.stringify(data.user));

      toast.success("¡Bienvenido!", {
        description: `Hola ${data.user.name || data.user.user}`,
      });

      // 3. Lógica de Redirección según el Rol/Grupo devuelto por Django[cite: 3]
      const groups: string[] = data.user.groups || [];

     if (groups.includes('gerente')) {
        router.push('/manager');
      } else if (groups.includes('empleado')) { 
        router.push('/kitchen');
      } else if (groups.includes('cliente')) {
        router.push('/menu');
      } else {
        router.push('/dashboard');
      }

    }  catch (error) {
      console.error('Error en el login', error);

      // Verificamos si el error proviene de Axios
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          toast.error("Error de autenticación", {
            description: "El usuario o la contraseña introducidos no coinciden con nuestros registros.",
          });
          setErrors({
            user: "Credenciales incorrectas",
            password: "Verifica tus datos",
          });
        } else {
          toast.error("Error del sistema", {
            description: "Hubo un problema al conectar con el servidor. Inténtalo de nuevo.",
          });
        }
      } else {
        // Para cualquier otro error no relacionado con la petición HTTP
        toast.error("Error inesperado", {
          description: "Ocurrió un error inesperado al procesar la solicitud.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    toast.warning("Autenticación externa", {
      description: "El inicio de sesión con Google estará disponible próximamente.",
    });
  };

  const isFieldValid = (name: 'user' | 'password') => {
    return formData[name].length > 0 && !errors[name];
  };

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