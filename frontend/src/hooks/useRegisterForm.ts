import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { api } from "@/lib/api";

interface RegisterErrors {
  name?: string;
  lastname?: string;
  user?: string;
  password?: string;
  confirmPassword?: string;
  school_id?: string;
}

type BackendErrors = Record<string, string | string[] | undefined>;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.mx$/;

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function useRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    user: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    school_id: '' as number | '',
  });

  const [errors, setErrors] = useState<RegisterErrors>({});

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const validateField = (
    name: keyof RegisterErrors,
    value: string,
    currentFormData = formData
  ): string => {
    if (!String(value).trim()) return "Este campo es requerido.";

    if ((name === 'name' || name === 'lastname') && String(value).trim().length < 2) {
      return "Debe tener al menos 2 caracteres.";
    }

    if (name === 'user') {
      if (!EMAIL_REGEX.test(String(value))) {
        return "Introduce un correo electrónico institucional válido (.edu.mx).";
      }
    }

    if (name === 'school_id' && !value) {
      return "Selecciona una escuela.";
    }

    if (name === 'password' && String(value).length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (name === 'confirmPassword' && value !== currentFormData.password) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const isCheckbox = type === 'checkbox';
    const checked = (target as HTMLInputElement).checked;
    const rawValue = isCheckbox ? checked : value;

    const updatedFormData = {
      ...formData,
      [name]: name === 'school_id' && !isCheckbox ? (value === '' ? '' : Number(value)) : rawValue,
    } as typeof formData;

    setFormData(updatedFormData);

    if (!isCheckbox) {
      const fieldError = validateField(
        name as keyof RegisterErrors,
        String(value),
        updatedFormData
      );

      if (name === 'password' && updatedFormData.confirmPassword) {
        const confirmError = validateField(
          'confirmPassword',
          updatedFormData.confirmPassword,
          updatedFormData
        );
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
      hasMinLength: password.length >= 8,
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

  const mapBackendErrors = (data: BackendErrors): RegisterErrors => {
    const next: RegisterErrors = {};

    const nonFieldErrors = pickFirst(data.non_field_errors);
    if (nonFieldErrors) {
      next.user = nonFieldErrors;
    }

    const schoolError = pickFirst(data.school_id);
    if (schoolError) {
      next.school_id = schoolError;
    }

    const userError = pickFirst(data.user);
    if (userError && !next.user) {
      next.user = userError;
    }

    const passwordError = pickFirst(data.password);
    if (passwordError) {
      next.password = passwordError;
    }

    const nameError = pickFirst(data.name);
    if (nameError) {
      next.name = nameError;
    }

    return next;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const nameErr = validateField('name', formData.name);
    const lastnameErr = validateField('lastname', formData.lastname);
    const userErr = validateField('user', formData.user);
    const passwordErr = validateField('password', formData.password);
    const confirmPasswordErr = validateField('confirmPassword', formData.confirmPassword);
    const schoolErr = validateField('school_id', String(formData.school_id));

    if (
      nameErr || lastnameErr || userErr || passwordErr ||
      confirmPasswordErr || schoolErr
    ) {
      setErrors({
        name: nameErr,
        lastname: lastnameErr,
        user: userErr,
        password: passwordErr,
        confirmPassword: confirmPasswordErr,
        school_id: schoolErr,
      });
      toast.error("Formulario no válido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/register/', {
        user: formData.user,
        name: formData.name,
        lastname: formData.lastname,
        password: formData.password,
        school_id: Number(formData.school_id),
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userData', JSON.stringify(user));

      toast.success('¡Registro Exitoso!', {
        description: 'Cuenta creada. Redirigiéndote al menú...',
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/menu');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = mapBackendErrors(
          error.response.data as BackendErrors
        );

        if (Object.keys(backendErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...backendErrors }));
          const firstMessage =
            backendErrors.user ||
            backendErrors.school_id ||
            backendErrors.password ||
            backendErrors.name;
          toast.error("No se pudo crear la cuenta", {
            description: firstMessage ?? "Revisa los datos ingresados.",
          });
          return;
        }
      }

      toast.error("Error del sistema", {
        description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFieldValid = (name: keyof RegisterErrors) => {
    const value = formData[name];
    if (name === 'school_id') {
      return value !== '' && !errors[name];
    }
    return String(value ?? '').length > 0 && !errors[name];
  };

  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.lastname.trim() &&
    formData.user.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.school_id !== '' &&
    formData.acceptedTerms &&
    !errors.name &&
    !errors.lastname &&
    !errors.user &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.school_id
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
