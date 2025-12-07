"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }, [value]);

    const updateValue = (newValue: T) => {
        setValue(newValue);
        try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch {}
    };

    return [value, updateValue] as const;
}
