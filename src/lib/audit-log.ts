
import { useCompany } from "@/hooks/use-company";

type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'LOGOUT';

export interface AuditLog {
  id: string;
  timestamp: Date;
  user: string; // For now, we'll hardcode a user name
  action: AuditLogAction;
  module: string;
  details: string;
}

// This is a simplified client-side logger. In a real app, this would be an API call.
export const logAudit = (
    setter: (value: AuditLog[] | ((prev: AuditLog[]) => AuditLog[])) => void,
    action: AuditLogAction,
    module: string,
    details: string
) => {
    const newLog: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        user: 'Geovani Nunes', // Hardcoded for now
        action,
        module,
        details,
    };
    setter(prevLogs => [newLog, ...prevLogs]);
};

    