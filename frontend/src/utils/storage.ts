const ADMIN_TOKEN_KEY = 'admin_token';
const USER_DOCUMENTS_KEY = 'user_documents';

export interface StoredDocument {
  id: string;
  uploadedAt: string;
  type: 'file' | 'text';
  name?: string;
}

// Admin token management
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const removeAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken();
};

// User documents management
export const getUserDocuments = (): StoredDocument[] => {
  const stored = localStorage.getItem(USER_DOCUMENTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const addUserDocument = (doc: StoredDocument): void => {
  const documents = getUserDocuments();
  const exists = documents.some(d => d.id === doc.id);
  if (!exists) {
    documents.unshift(doc);
    localStorage.setItem(USER_DOCUMENTS_KEY, JSON.stringify(documents));
  }
};

export const removeUserDocument = (documentId: string): void => {
  const documents = getUserDocuments();
  const filtered = documents.filter(d => d.id !== documentId);
  localStorage.setItem(USER_DOCUMENTS_KEY, JSON.stringify(filtered));
};

export const clearUserDocuments = (): void => {
  localStorage.removeItem(USER_DOCUMENTS_KEY);
};
