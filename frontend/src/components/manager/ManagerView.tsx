"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Branch, BranchUpdateData } from '@/types/manager';
import { api } from '@/lib/api';
import { ManagerHeader } from './ManagerHeader';
import { BranchHeader } from './BranchHeader';
import { BranchCard } from './BranchCard';
import { MenuManagerView } from './menu/MenuManagerView';

const DashboardView = dynamic(
  () => import('./dashboard/DashboardView').then((m) => m.DashboardView),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  },
);

function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Cargando dashboard"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted/40 h-7 w-40 rounded" />
          <div className="bg-muted/40 h-4 w-72 rounded" />
        </div>
        <div className="bg-muted/40 h-8 w-44 rounded-lg" />
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted/40 h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-muted/40 h-72 rounded-xl" />
        <div className="bg-muted/40 h-72 rounded-xl" />
      </div>
      <div className="bg-muted/40 h-72 rounded-xl" />
      <div className="bg-muted/40 h-80 rounded-xl" />
    </div>
  );
}

interface BackendBranch {
  id: number;
  name: string;
  company: number;
  company_name: string;
  school_id: number | null;
  school_name: string | null;
  location: string | null;
  schedule: string | null;
  image: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function toBranch(b: BackendBranch): Branch {
  return {
    id: String(b.id),
    name: b.name,
    address: b.location || '',
    employeesCount: 0,
    schedule: b.schedule || '',
    dailySales: 0,
    status: b.active ? 'open' : 'closed',
    imageUrl: b.image ? b.image : '',
  };
}

function buildBranchFormData(data: BranchUpdateData): FormData {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('location', data.location);
  formData.append('schedule', data.schedule);
  formData.append('active', String(data.active));
  if (data.imageFile) {
    formData.append('image', data.imageFile);
  }
  return formData;
}

export function ManagerView() {
  const router = useRouter();

  const [isAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;

    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) return false;

    try {
      const userData = JSON.parse(userDataStr);
      const groups: string[] = userData.groups ?? [];
      return groups.includes("gerente") || groups.includes("supervisor");
    } catch {
      return false;
    }
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'branches' | 'menu' | 'users' | 'dashboard'>('branches');

  useEffect(() => {
    if (!isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    if (!isAuthorized) return;

    let cancelled = false;

    api
      .get<BackendBranch[]>('/api/branches/')
      .then(({ data }) => {
        if (!cancelled) setBranches(data.map(toBranch));
      })
      .catch(() => {
        if (!cancelled) {
          setBranchesError('No se pudieron cargar las sucursales. Intenta de nuevo.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBranches(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthorized]);

  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la sucursal "${name}"?`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleUpdateBranch = async (id: string, data: BranchUpdateData): Promise<boolean> => {
    const path = `/api/branches/${id}/update/`;

    try {
      const { data: updated } = data.imageFile
        ? await api.put<BackendBranch>(path, buildBranchFormData(data))
        : await api.put<BackendBranch>(path, {
            name: data.name,
            location: data.location,
            schedule: data.schedule,
            active: data.active,
          });

      setBranches(prev => prev.map(b => (b.id === id ? toBranch(updated) : b)));
      toast.success('Sucursal actualizada', {
        description: `Los cambios en "${updated.name}" se guardaron correctamente.`,
      });
      return true;
    } catch {
      toast.error('Error al actualizar la sucursal', {
        description: 'No se pudieron guardar los cambios. Intenta de nuevo.',
      });
      return false;
    }
  };

  const handleAddBranch = () => {
    alert("Modal de agregar sucursal próximamente...");
  };

  const handleManageBranch = () => {
    setActiveTab('menu');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-on-surface-variant font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <ManagerHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {activeTab === 'dashboard' ? (
          <DashboardView />
        ) : activeTab === 'menu' ? (
          <MenuManagerView />
        ) : (
          <>
            <BranchHeader onAddBranch={handleAddBranch} />

            {isLoadingBranches ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : branchesError ? (
              <div className="text-center py-16 text-sm text-on-surface-variant">
                {branchesError}
              </div>
            ) : branches.length === 0 ? (
              <div className="text-center py-16 text-sm text-on-surface-variant">
                No tienes sucursales registradas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {branches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    onDelete={handleDeleteBranch}
                    onSave={handleUpdateBranch}
                    onManage={handleManageBranch}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
