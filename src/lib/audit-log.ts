
export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'LOGOUT';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditLogAction;
  module: string;
  details: string;
}

// This is a simplified client-side logger. In a real app, this would be an API call.
export const logAudit = (
    setter: (value: AuditLog[]) => void,
    action: AuditLogAction,
    module: string,
    details: string,
    currentLogs: AuditLog[]
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
        timestamp: new Date().toISOString(),
        user: userName,
        action,
        module,
        details,
    };
    setter([newLog, ...currentLogs]);
};
