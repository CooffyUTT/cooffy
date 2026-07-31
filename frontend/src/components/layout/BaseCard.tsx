"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function BaseCard({ children, className = "", animate = false }: BaseCardProps) {
  const baseStyles =
    "bg-surface dark:bg-surface-dim rounded-2xl border border-outline-variant/20 shadow-[0px_4px_20px_rgba(30,58,90,0.05)] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group";

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${baseStyles} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
}

/* Subcomponente para la imagen con badge opcional */
interface CardMediaProps {
  src?: string;
  alt: string;
  badge?: React.ReactNode;
  fallbackText?: string;
  className?: string;
}

export function CardMedia({ src, alt, badge, fallbackText, className = "h-36 w-full" }: CardMediaProps) {
  return (
    <div className={`relative bg-surface-container-low overflow-hidden shrink-0 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[11px] text-on-surface-variant/50">
          {fallbackText || "Sin imagen"}
        </div>
      )}
      {badge && <div className="absolute top-2 left-2 z-10">{badge}</div>}
    </div>
  );
}

/* Subcomponente para el pie de la tarjeta (acciones) */
export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pt-4 border-t border-outline-variant/10 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}