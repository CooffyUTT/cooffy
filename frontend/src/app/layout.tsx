import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "./providers";
import "./globals.css";

// Fuente principal de Cooffy
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Cooffy", // El %s será reemplazado por el título de la página interna
    default: "Cooffy", // Título por defecto si la página no define uno
  },
  description: "Portal para el menú de la cocina",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
