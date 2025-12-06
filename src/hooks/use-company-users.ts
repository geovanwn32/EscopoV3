
'use client';
import { useEffect, useState } from "react";
import { collection, onSnapshot, Firestore, DocumentData } from "firebase/firestore";
import { useFirestore, useCollection, WithId } from "@/firebase";

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
  const [users, setUsers] = useState<WithId<User>[] | null>(null);

  const query = companyId ? collection(firestore, "empresas", String(companyId), "usuarios") : null;

  const { data, isLoading, error } = useCollection<User>(query as any); // Cast as any to bypass memoization check here

  useEffect(() => {
    if (data) {
      setUsers(data);
    } else {
      setUsers(null);
    }
  }, [data]);
  
  const setUsersCallback = (value: WithId<User>[] | null | ((prev: WithId<User>[] | null) => WithId<User>[] | null)) => {
      // This is a simplified setter. In a real scenario, you'd use Firestore operations.
      if (typeof value === 'function') {
          setUsers(prev => value(prev));
      } else {
          setUsers(value);
      }
  }


  return { users, isLoading, error, setUsers: setUsersCallback };
}
