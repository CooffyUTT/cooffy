import { z } from "zod"; // Asegúrate de tener instalado zod[cite: 2]

export const loginSchema = z.object({
  credentials: z.string().min(3, { message: "El correo o usuario es requerido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export type LoginFields = z.infer<typeof loginSchema>;