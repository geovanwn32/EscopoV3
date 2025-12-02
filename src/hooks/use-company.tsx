
"use client";

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of a company and its data
interface CompanyData {
    [key: string]: any;
}

export interface Company {
    id: number;
    name: string;
    data?: CompanyData;
}

// Define the context shape
interface CompanyContextType {
    companies: Company[];
    currentCompany: number | null;
    isLoaded: boolean;
    switchCompany: (companyId: number) => void;
    addCompany: () => void;
    updateCompany: (companyId: number, companyData: Company) => void;
    useScopedData: <T>(key: string, defaultValue: T) => [T, (value: T) => void];
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const LS_COMPANIES_KEY = 'companies';
const LS_CURRENT_COMPANY_KEY = 'currentCompany';

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [currentCompany, setCurrentCompany] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedCompanies = localStorage.getItem(LS_COMPANIES_KEY);
            const storedCurrentCompany = localStorage.getItem(LS_CURRENT_COMPANY_KEY);

            const initialCompanies = storedCompanies ? JSON.parse(storedCompanies) : [];
            setCompanies(initialCompanies);

            let companyId = storedCurrentCompany ? JSON.parse(storedCurrentCompany) : null;
            
            // If no company is selected but there are companies, select the first one.
            if (!companyId && initialCompanies.length > 0) {
                companyId = initialCompanies[0].id;
                localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(companyId));
            }

            setCurrentCompany(companyId);

        } catch (error) {
            console.error("Failed to load company data from localStorage", error);
            setCompanies([]);
            setCurrentCompany(null);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem(LS_COMPANIES_KEY, JSON.stringify(companies));
        } catch (error) {
            console.error("Failed to save companies to localStorage", error);
        }
    }, [companies, isLoaded]);

    const switchCompany = useCallback((companyId: number) => {
        setCurrentCompany(companyId);
        try {
            localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(companyId));
            // Instead of reloading, we can just push to dashboard and let the layout re-render
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to save current company to localStorage", error);
        }
    }, [router]);

    const addCompany = useCallback(() => {
        const newCompanyId = Date.now();
        const newCompany: Company = {
            id: newCompanyId,
            name: `Nova Empresa ${companies.length + 1}`,
            data: {},
        };
        // We temporarily set the new company as current before redirecting
        // So the layout guard doesn't block the navigation to /minha-empresa
        setCurrentCompany(newCompanyId);
        setCompanies(prev => [...prev, newCompany]);
        localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(newCompanyId));
        router.push('/minha-empresa');
    }, [companies.length, router]);

    const updateCompany = useCallback((companyId: number, companyData: Company) => {
        setCompanies(prev => prev.map(c => c.id === companyId ? companyData : c));
    }, []);

    const useScopedData = <T,>(key: string, defaultValue: T): [T, (value: T) => void] => {
        const scopedKey = `company-${currentCompany}-${key}`;
        
        const [data, setData] = useState<T>(() => {
            if (typeof window === 'undefined' || !currentCompany) return defaultValue;
            try {
                const item = localStorage.getItem(scopedKey);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error(`Error reading ${scopedKey} from localStorage`, error);
                return defaultValue;
            }
        });

        // Effect to update data if company changes
        useEffect(() => {
            if (isLoaded && currentCompany) {
                 try {
                    const item = localStorage.getItem(scopedKey);
                    setData(item ? JSON.parse(item) : defaultValue);
                } catch (error) {
                    console.error(`Error re-reading ${scopedKey} from localStorage on company switch`, error);
                    setData(defaultValue);
                }
            } else if (!currentCompany) {
                setData(defaultValue);
            }
        }, [currentCompany, isLoaded, scopedKey, defaultValue]);


        const setScopedData = useCallback((value: T | ((prev: T) => T)) => {
            if (typeof window !== 'undefined' && currentCompany) {
                try {
                    const valueToStore = value instanceof Function ? value(data) : value;
                    localStorage.setItem(scopedKey, JSON.stringify(valueToStore));
                    setData(valueToStore);
                } catch (error) {
                    console.error(`Error writing ${scopedKey} to localStorage`, error);
                }
            }
        }, [currentCompany, scopedKey, data]);

        return [data, setScopedData as (value: T) => void];
    };


    const contextValue = {
        companies,
        currentCompany,
        isLoaded,
        switchCompany,
        addCompany,
        updateCompany,
        useScopedData
    };

    return (
        <CompanyContext.Provider value={contextValue}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
