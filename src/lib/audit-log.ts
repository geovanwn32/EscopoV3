
export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'LOGOUT';

export interface AuditLog {
  id: string;
  timestamp: string; // Changed from Date to string
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
    let userName = 'Sistema'; // Default user
    if (typeof window !== 'undefined') {
        const profileString = sessionStorage.getItem('user-profile');
        if (profileString) {
            try {
                const profile = JSON.parse(profileString);
                userName = profile.name || 'Usuário Desconhecido';
            } catch (e) {
                // Ignore parsing error, use default
            }
        }
    }


    const newLog: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(), // Convert Date object to ISO string
        user: userName,
        action,
        module,
        details,
    };
    setter(prevLogs => [newLog, ...prevLogs]);
};
