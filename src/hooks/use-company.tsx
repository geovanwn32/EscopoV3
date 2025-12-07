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
    getDoc,
} from 'firebase/firestore';
import { useUser } from '@/firebase';

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

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { firestore } = initializeFirebase();
    const { user } = useUser();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [currentCompany, setCurrentCompany] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // ---------------------------
    // 1 — CARREGAR EMPRESAS DO FIRESTORE
    // ---------------------------
    useEffect(() => {
        if (!user) return;

        const q = query(collection(firestore, `users/${user.uid}/companies`));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Company[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Company[];

            setCompanies(list);

            const lastCompanyId = localStorage.getItem('currentCompany');
            if (lastCompanyId && list.some(c => c.id === lastCompanyId)) {
                setCurrentCompany(lastCompanyId);
            } else if (!currentCompany && list.length > 0) {
                setCurrentCompany(list[0].id);
            } else if (list.length === 0) {
                setCurrentCompany(null);
            }

            setIsLoaded(true);
        }, (error) => {
            console.error("Erro ao carregar empresas:", error);
            setIsLoaded(true);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    // ---------------------------
    // 2 — MUDA EMPRESA ATUAL
    // ---------------------------
    const switchCompany = useCallback((companyId: string, navigate = true) => {
        setCurrentCompany(companyId);
        localStorage.setItem('currentCompany', companyId);
        if (navigate && window.location.pathname !== '/dashboard') {
            router.push('/dashboard');
        }
    }, [router]);

    // ---------------------------
    // 3 — CRIAR EMPRESA
    // ---------------------------
    const addCompany = useCallback(async (name: string, data: CompanyData = {}) => {
        if (!user) return;

        const companyPayload = {
            name,
            data,
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(
            collection(firestore, `users/${user.uid}/companies`),
            companyPayload
        );

        setCurrentCompany(docRef.id);
        localStorage.setItem('currentCompany', docRef.id);
        return docRef.id;
    }, [user, firestore]);

    // ---------------------------
    // 4 — ATUALIZAR EMPRESA
    // ---------------------------
    const updateCompany = useCallback(async (companyId: string, companyData: Partial<Company>) => {
        if (!user) return;

        const docRef = doc(firestore, `users/${user.uid}/companies/${companyId}`);
        await setDoc(docRef, companyData, { merge: true });
    }, [user, firestore]);

    // ---------------------------
    // 5 — DELETAR EMPRESA
    // ---------------------------
    const deleteCompany = useCallback(async (companyId: string) => {
        if (!user) return;

        await deleteDoc(doc(firestore, `users/${user.uid}/companies/${companyId}`));

        if (currentCompany === companyId) {
            const remaining = companies.filter((c) => c.id !== companyId);
            const newCurrentId = remaining[0]?.id || null;
            setCurrentCompany(newCurrentId);
            if (newCurrentId) {
                 localStorage.setItem('currentCompany', newCurrentId);
            } else {
                 localStorage.removeItem('currentCompany');
            }
           
            if (remaining.length === 0) {
                 router.push("/selecionar-empresa");
            }
        }
    }, [user, currentCompany, companies, firestore, router]);

    // ---------------------------
    // 6 — useScopedData → subcoleção scopedData
    // ---------------------------
    const useScopedData = <T,>(key: string, defaultValue: T): [T, (value: T) => Promise<void>] => {
        const [data, setData] = useState<T>(defaultValue);

        useEffect(() => {
            if (!user || !currentCompany) return;

            const ref = doc(
                firestore,
                `users/${user.uid}/companies/${currentCompany}/scopedData/${key}`
            );

            const unsub = onSnapshot(ref, (snapshot) => {
                if (snapshot.exists()) {
                    setData(snapshot.data().value as T);
                } else {
                    setData(defaultValue);
                }
            });

            return () => unsub();
        }, [user, currentCompany, key]);

        const updateValue = async (value: T) => {
            if (!user || !currentCompany) return;

            const ref = doc(
                firestore,
                `users/${user.uid}/companies/${currentCompany}/scopedData/${key}`
            );

            await setDoc(ref, { value }, { merge: true });
        };

        return [data, updateValue];
    };

    const contextValue: CompanyContextType = {
        companies,
        currentCompany,
        isLoaded,
        switchCompany,
        addCompany,
        updateCompany,
        deleteCompany,
        useScopedData,
    };

    return (
        <CompanyContext.Provider value={contextValue}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
