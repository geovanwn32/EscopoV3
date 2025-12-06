
'use client';
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, Firestore, DocumentData, query } from "firebase/firestore";
import { useFirestore, useCollection, WithId, useMemoFirebase } from "@/firebase";

interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isMaster?: boolean;
  permissions: any; // You might want a more specific type here
  allowedCompanyIds: string[];
  password?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  planoId?: 'Gratuito' | 'Basico' | 'Profissional' | 'Empresarial';
  statusLicenca?: 'Ativa' | 'Inadimplente' | 'Cancelada' | 'Expirada';
  photoURL?: string;
}

export function useCompanyUsers(companyId: number | null) {
  const firestore = useFirestore();
  
  const companyUsersQuery = useMemoFirebase(() => {
    if (!companyId) return null;
    return query(collection(firestore, "empresas", String(companyId), "usuarios"));
  }, [firestore, companyId]);

  const { data, isLoading, error } = useCollection<User>(companyUsersQuery as any);

  return { users: data, isLoading, error };
}
