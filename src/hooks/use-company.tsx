
"use client";

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode, useRef } from 'react';

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
    switchCompany: (companyId: number, navigate?: boolean) => void;
    addCompany: (name: string, data?: CompanyData) => void;
    updateCompany: (companyId: number, companyData: Company) => void;
    deleteCompany: (companyId: number) => void;
    useScopedData: <T>(key: string, defaultValue: T) => [T, (value: T | ((prev: T) => T)) => void];
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
            
            if (companyId && !initialCompanies.some((c: Company) => c.id === companyId)) {
                companyId = initialCompanies.length > 0 ? initialCompanies[0].id : null;
            }

            // If still no company ID after checks, and there are companies, set to the first one.
            if (!companyId && initialCompanies.length > 0) {
                 companyId = initialCompanies[0].id;
            }
            
            setCurrentCompany(companyId);
            if (companyId) {
                localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(companyId));
            } else {
                 localStorage.removeItem(LS_CURRENT_COMPANY_KEY);
            }

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

    const switchCompany = useCallback((companyId: number, navigate = true) => {
        setCurrentCompany(companyId);
        try {
            localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(companyId));
            if (navigate) {
                 if (window.location.pathname !== '/dashboard') {
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            console.error("Failed to save current company to localStorage", error);
        }
    }, [router]);

    const addCompany = useCallback((name: string, data?: CompanyData) => {
        const newCompanyId = Date.now();
        const newCompany: Company = {
            id: newCompanyId,
            name: name,
            data: data || {},
        };
        setCompanies(prev => {
            const updatedCompanies = [...prev, newCompany];
            // If this is the first company, also set it as current
            if (prev.length === 0) {
                setCurrentCompany(newCompanyId);
                localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(newCompanyId));
            }
            return updatedCompanies;
        });
        // Switch to the new company, but don't navigate immediately
        // The calling component will handle navigation
        switchCompany(newCompanyId, false);
    }, [switchCompany]);

    const updateCompany = useCallback((companyId: number, companyData: Company) => {
        setCompanies(prev => prev.map(c => c.id === companyId ? companyData : c));
    }, []);

    const deleteCompany = useCallback((companyId: number) => {
        let nextCompanyId: number | null = null;
        let needsRedirect = false;

        setCompanies(prevCompanies => {
            const remainingCompanies = prevCompanies.filter(c => c.id !== companyId);
            
            if (currentCompany === companyId) {
                if (remainingCompanies.length > 0) {
                    nextCompanyId = remainingCompanies[0].id;
                } else {
                    nextCompanyId = null;
                    needsRedirect = true;
                }
            }
            return remainingCompanies;
        });
        
        // Delete scoped data from localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`company-${companyId}-`)) {
                localStorage.removeItem(key);
            }
        });

        // Update current company and localStorage after state update
        if (currentCompany === companyId) {
            setCurrentCompany(nextCompanyId);
            if (nextCompanyId) {
                localStorage.setItem(LS_CURRENT_COMPANY_KEY, JSON.stringify(nextCompanyId));
            } else {
                localStorage.removeItem(LS_CURRENT_COMPANY_KEY);
            }
        }

        // Perform navigation if necessary
        if (needsRedirect) {
            router.push('/selecionar-empresa');
        }
    }, [currentCompany, router]);


    const useScopedData = <T,>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
        const scopedKey = `company-${currentCompany}-${key}`;
        const defaultValueRef = useRef(defaultValue);

        const [data, setData] = useState<T>(() => {
            if (typeof window === 'undefined' || !currentCompany) return defaultValueRef.current;
            try {
                const item = localStorage.getItem(scopedKey);
                return item ? JSON.parse(item) : defaultValueRef.current;
            } catch (error) {
                console.error(`Error reading ${scopedKey} from localStorage`, error);
                return defaultValueRef.current;
            }
        });

        useEffect(() => {
            if (isLoaded && currentCompany) {
                 try {
                    const item = localStorage.getItem(scopedKey);
                    const value = item ? JSON.parse(item) : defaultValueRef.current;
                    setData(value);
                } catch (error) {
                    console.error(`Error re-reading ${scopedKey} from localStorage on company switch`, error);
                    setData(defaultValueRef.current);
                }
            } else if (!currentCompany) {
                setData(defaultValueRef.current);
            }
        }, [currentCompany, isLoaded, scopedKey]);

        const setScopedData = useCallback((value: T | ((prev: T) => T)) => {
            if (typeof window !== 'undefined' && currentCompany) {
                setData(prevData => {
                    const newValue = value instanceof Function ? value(prevData) : value;
                    try {
                        localStorage.setItem(scopedKey, JSON.stringify(newValue));
                    } catch (error) {
                        console.error(`Error writing ${scopedKey} to localStorage`, error);
                    }
                    return newValue;
                });
            }
        }, [currentCompany, scopedKey]);

        return [data, setScopedData];
    };


    const contextValue = {
        companies,
        currentCompany,
        isLoaded,
        switchCompany,
        addCompany,
        updateCompany,
        deleteCompany,
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
