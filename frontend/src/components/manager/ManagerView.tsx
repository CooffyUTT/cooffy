"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Branch } from '@/types/manager';
import { api } from '@/lib/api';
import { ManagerHeader } from './ManagerHeader';
import { BranchHeader } from './BranchHeader';
import { BranchCard } from './BranchCard';

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

export function ManagerView() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;

    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) return false;

    try {
      const userData = JSON.parse(userDataStr);
      return Boolean(userData.groups && userData.groups.includes("gerente"));
    } catch {
      return false;
    }
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'dashboard'>('branches');

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

  const handleAddBranch = () => {
    alert("Modal de agregar sucursal próximamente...");
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
