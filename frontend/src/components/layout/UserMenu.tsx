"use client";

import React, { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

interface UserMenuProps {
  userName: string;
  className?: string;
}

export function UserMenu({ userName, className }: UserMenuProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { performLogout, isLoading } = useLogout();

  const handleOpenModal = () => {
    // Un leve timeout asegura que el portal del Dropdown no bloquee la apertura del Dialog
    setTimeout(() => {
      setShowConfirmModal(true);
    }, 10);
  };

  const handleConfirmLogout = async () => {
    await performLogout();
    setShowConfirmModal(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="user-menu-trigger"
          aria-label={`Menú de ${userName}`}
          title={userName}
          className={
            className ||
            "w-10 h-10 rounded-full bg-primary-container/20 border border-outline-variant/30 flex items-center justify-center cursor-pointer hover:bg-primary-container/30 transition-colors"
          }
        >
          <UserIcon className="h-5 w-5 text-primary" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
              <span className="text-sm font-semibold text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground">Sesión activa</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Cambiado a onClick para mayor compatibilidad con Base UI */}
          <DropdownMenuItem
            variant="destructive"
            onClick={handleOpenModal}
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de confirmación */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent showCloseButton={!isLoading}>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas salir de Cooffy? Tendrás que volver a iniciar sesión para acceder a tus pedidos.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
              Cancelar
            </DialogClose>
            
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              disabled={isLoading}
            >
              {isLoading ? "Cerrando..." : "Sí, cerrar sesión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}