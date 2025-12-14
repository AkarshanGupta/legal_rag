import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { StoredDocument, getUserDocuments, addUserDocument, removeUserDocument, getAdminToken, setAdminToken, removeAdminToken } from '@/utils/storage';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextType {
  // Admin auth
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  
  // User documents
  userDocuments: StoredDocument[];
  addDocument: (doc: StoredDocument) => void;
  removeDocument: (id: string) => void;
  refreshDocuments: () => void;
  
  // Toast notifications
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminToken, setAdminTokenState] = useState<string | null>(getAdminToken());
  const [userDocuments, setUserDocuments] = useState<StoredDocument[]>(getUserDocuments());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loginAdmin = useCallback((token: string) => {
    setAdminToken(token);
    setAdminTokenState(token);
  }, []);

  const logoutAdmin = useCallback(() => {
    removeAdminToken();
    setAdminTokenState(null);
  }, []);

  const addDocument = useCallback((doc: StoredDocument) => {
    addUserDocument(doc);
    setUserDocuments(getUserDocuments());
  }, []);

  const removeDocument = useCallback((id: string) => {
    removeUserDocument(id);
    setUserDocuments(getUserDocuments());
  }, []);

  const refreshDocuments = useCallback(() => {
    setUserDocuments(getUserDocuments());
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        adminToken,
        isAdminAuthenticated: !!adminToken,
        loginAdmin,
        logoutAdmin,
        userDocuments,
        addDocument,
        removeDocument,
        refreshDocuments,
        toasts,
        showToast,
        removeToast,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
