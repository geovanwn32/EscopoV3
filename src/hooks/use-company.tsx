
"use client";

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of a company and its data
interface CompanyData {
    [key: string]: any;
}

interface Company {
    id: number;
    name: string;
    data?: CompanyData;
}

// Define the context shape
interface CompanyContextType {
    companies: Company[];
    currentCompany: number | null;
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
            // Reload to ensure all components reset and fetch new scoped data
             window.location.reload();
        } catch (error) {
            console.error("Failed to save current company to localStorage", error);
        }
    }, []);

    const addCompany = useCallback(() => {
        const newCompanyId = Date.now();
        const newCompany: Company = {
            id: newCompanyId,
            name: `Nova Empresa ${companies.length + 1}`,
            data: {},
        };
        setCompanies(prev => [...prev, newCompany]);
        switchCompany(newCompanyId);
        router.push('/minha-empresa');
    }, [companies, switchCompany, router]);

    const updateCompany = useCallback((companyId: number, companyData: Company) => {
        setCompanies(prev => prev.map(c => c.id === companyId ? companyData : c));
        // If the current company is the one being updated, its name might change.
        // The UI should reflect this automatically from the companies state.
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

        useEffect(() => {
            if (typeof window !== 'undefined' && currentCompany) {
                 try {
                    const item = localStorage.getItem(scopedKey);
                    setData(item ? JSON.parse(item) : defaultValue);
                } catch (error) {
                    console.error(`Error reading ${scopedKey} from localStorage`, error);
                    setData(defaultValue);
                }
            } else {
                setData(defaultValue);
            }
        }, [currentCompany, scopedKey, defaultValue]);


        const setScopedData = useCallback((value: T) => {
            if (typeof window !== 'undefined' && currentCompany) {
                try {
                    const valueToStore = JSON.stringify(value);
                    localStorage.setItem(scopedKey, valueToStore);
                    setData(value);
                } catch (error) {
                    console.error(`Error writing ${scopedKey} to localStorage`, error);
                }
            }
        }, [currentCompany, scopedKey]);

        return [data, setScopedData];
    };


    if (!isLoaded) {
        return null;
    }

    const contextValue = {
        companies,
        currentCompany,
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
