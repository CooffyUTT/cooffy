import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RegisterErrors {
  name?: string;
  lastname?: string;
  user?: string;
  password?: string;
  confirmPassword?: string;
}

export function useRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false); // <-- Visibilidad para la confirmación
  
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    user: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    school_id: '1'
  });

  const [errors, setErrors] = useState<RegisterErrors>({});

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const validateField = (name: string, value: string, currentFormData = formData): string => {
    if (!value.trim()) return "Este campo es requerido.";

    if ((name === 'name' || name === 'lastname') && value.trim().length < 2) {
      return "Debe tener al menos 2 caracteres.";
    }

    if (name === 'user') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Introduce un correo electrónico institucional válido.";
    }
  }

    if (name === 'password' && value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (name === 'confirmPassword') {
      if (value !== currentFormData.password) {
        return "Las contraseñas no coinciden.";
      }
    }

    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
   const val = type === 'checkbox' ? checked : value;
    const updatedFormData = { ...formData, [name]: val };
    setFormData(updatedFormData);

    if (type !== 'checkbox') {
      let fieldError = validateField(name, value, updatedFormData);
      
      if (name === 'password' && updatedFormData.confirmPassword) {
        const confirmError = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }

      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }

    
  };

  const handleSSORegister = () => {
    if (isLoading) return;
    toast.info("Conectando con Google...", {
      description: "Serás redirigido para completar el registro.",
    });
  };

  const getPasswordRequirements = (password: string) => {
    return {
      hasMinLength: password.length >= 6,
      hasUpperAndLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };
  };

  const passwordRequirements = getPasswordRequirements(formData.password);

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };

    const reqs = getPasswordRequirements(password);
    const score = Object.values(reqs).filter(Boolean).length;

    switch (score) {
      case 1:
        return { score: 1, label: 'Débil', color: 'bg-destructive' };
      case 2:
        return { score: 2, label: 'Regular', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Buena', color: 'bg-emerald-500' };
      case 4:
        return { score: 4, label: 'Excelente', color: 'bg-yellow-300' };
      default:
        return { score: 0, label: '', color: 'bg-outline-variant' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const nameErr = validateField('name', formData.name);
    const lastnameErr = validateField('lastname', formData.lastname);
    const userErr = validateField('user', formData.user);
    const passwordErr = validateField('password', formData.password);
    const confirmPasswordErr = validateField('confirmPassword', formData.confirmPassword);

    if (nameErr || lastnameErr || userErr || passwordErr || confirmPasswordErr) {
      setErrors({ name: nameErr, lastname: lastnameErr, user: userErr, password: passwordErr, confirmPassword: confirmPasswordErr });
      toast.error("Formulario no válido");
      return;
    }

    setIsLoading(true);

    try {
      // Simulación de petición de registro al servidor de Cooffy (1.5 segundos)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("¡Registro Exitoso!", { 
        description: "Cuenta creada. Redirigiéndote al menú..." 
      });

      // Redirección inmediata a la página de inicio/menú de pedidos
      router.push('/menu'); 
      
    } catch (error) {
      toast.error("Error del sistema", { description: "No se pudo crear la cuenta." });
    } finally {
      setIsLoading(false);
    }
  };

  const isFieldValid = (name: 'name' | 'lastname' | 'user' | 'password' | 'confirmPassword') => {
    return formData[name].length > 0 && !errors[name];
  };

  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.lastname.trim() &&
    formData.user.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.acceptedTerms &&
    !errors.name &&
    !errors.lastname &&
    !errors.user &&
    !errors.password &&
    !errors.confirmPassword
  );

  return {
    formData,
    errors,
    isLoading,
    passwordVisible,
    confirmPasswordVisible,
    passwordStrength,
    passwordRequirements,
    isFormValid,
    isFieldValid,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleInputChange,
    handleRegister,
    handleSSORegister,  
  };
}