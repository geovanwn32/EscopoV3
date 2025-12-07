"use client";

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeFirebase } from '@/firebase';
import {
    collection,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
} from 'firebase/firestore';
import { useUser } from '@/firebase';

// ======================================================
// TYPES
// ======================================================

interface CompanyData {
    [key: string]: any;
}

export interface Company {
    id: string;
    name: string;
    data?: CompanyData;
}

interface CompanyContextType {
    companies: Company[];
    currentCompany: string | null;
    isLoaded: boolean;
    switchCompany: (companyId: string, navigate?: boolean) => void;
    addCompany: (name: string, data?: CompanyData) => Promise<string | undefined>;
    updateCompany: (companyId: string, companyData: Partial<Company>) => Promise<void>;
    deleteCompany: (companyId: string) => Promise<void>;
    useScopedData: <T>(key: string, defaultValue: T) => [T, (value: T) => Promise<void>];
}

// ======================================================
// CONTEXT
// ======================================================

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { firestore } = initializeFirebase();
    const { user } = useUser();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [currentCompany, setCurrentCompany] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // ======================================================
    // LOAD COMPANIES
    // ======================================================

    useEffect(() => {
        if (!user) return;

        const q = query(collection(firestore, `empresas`));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...(docSnap.data() as any),
                })) as Company[];

                setCompanies(list);

                const lastCompany = localStorage.getItem('currentCompany');

                if (lastCompany && list.some((c) => c.id === lastCompany)) {
                    setCurrentCompany(lastCompany);
                } else if (!currentCompany && list.length > 0) {
                    setCurrentCompany(list[0].id);
                } else if (list.length === 0) {
                    setCurrentCompany(null);
                }

                setIsLoaded(true);
            },
            (error) => {
                console.error("Erro ao carregar empresas:", error);
                setIsLoaded(true);
            }
        );

        return () => unsubscribe();
    }, [user, firestore]);

    // ======================================================
    // SWITCH COMPANY
    // ======================================================

    const switchCompany = useCallback(
        (companyId: string, navigate = true) => {
            setCurrentCompany(companyId);
            localStorage.setItem("currentCompany", companyId);

            if (navigate && window.location.pathname !== "/dashboard") {
                router.push("/dashboard");
            }
        },
        [router]
    );

    // ======================================================
    // ADD COMPANY
    // ======================================================

    const addCompany = useCallback(
        async (name: string, data: CompanyData = {}) => {
            if (!user) return;

            const payload = {
                name,
                data,
                createdAt: new Date().toISOString(),
                owner: user.uid,
            };

            const docRef = await addDoc(collection(firestore, `empresas`), payload);

            switchCompany(docRef.id, false);

            return docRef.id;
        },
        [user, firestore, switchCompany]
    );

    // ======================================================
    // UPDATE COMPANY
    // ======================================================

    const updateCompany = useCallback(
        async (companyId: string, companyData: Partial<Company>) => {
            if (!user) return;

            const ref = doc(firestore, `empresas/${companyId}`);
            await setDoc(ref, companyData, { merge: true });
        },
        [user, firestore]
    );

    // ======================================================
    // DELETE COMPANY
    // ======================================================

    const deleteCompany = useCallback(
        async (companyId: string) => {
            if (!user) return;

            await deleteDoc(doc(firestore, `empresas/${companyId}`));

            if (currentCompany === companyId) {
                const remaining = companies.filter((c) => c.id !== companyId);

                const nextId = remaining[0]?.id || null;
                setCurrentCompany(nextId);

                if (nextId) localStorage.setItem("currentCompany", nextId);
                else localStorage.removeItem("currentCompany");

                if (remaining.length === 0) router.push("/selecionar-empresa");
            }
        },
        [user, currentCompany, companies, firestore, router]
    );

    // ======================================================
    // SCOPED DATA (per company namespace)
    // ======================================================

    const useScopedData = <T,>(
        key: string,
        defaultValue: T
    ): [T, (value: T) => Promise<void>] => {
        const [data, setData] = useState<T>(defaultValue);

        useEffect(() => {
            if (!user || !currentCompany) return;

            const ref = doc(
                firestore,
                `empresas/${currentCompany}/scopedData/${key}`
            );

            const unsub = onSnapshot(ref, (snapshot) => {
                setData(snapshot.exists() ? (snapshot.data().value as T) : defaultValue);
            });

            return () => unsub();
        }, [user, currentCompany, key]);

        const updateValue = async (value: T) => {
            if (!user || !currentCompany) return;

            const ref = doc(
                firestore,
                `empresas/${currentCompany}/scopedData/${key}`
            );

            await setDoc(ref, { value }, { merge: true });
        };

        return [data, updateValue];
    };

    // ======================================================
    // CONTEXT VALUE
    // ======================================================

    return (
        <CompanyContext.Provider
            value={{
                companies,
                currentCompany,
                isLoaded,
                switchCompany,
                addCompany,
                updateCompany,
                deleteCompany,
                useScopedData,
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
};

// ======================================================
// HOOK: useCompany
// ======================================================

export const useCompany = () => {
    const ctx = useContext(CompanyContext);
    if (!ctx) throw new Error("useCompany must be used within a CompanyProvider");
    return ctx;
};

// ======================================================
// LOCAL STORAGE HOOK (organizado e sem conflitos)
// ======================================================

import { useState as useStateLS, useEffect as useEffectLS } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useStateLS<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffectLS(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [value]);

  return [value, setValue] as const;
}
