import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:10000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API client with token
export const createAdminClient = (token: string): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
    },
  });
  return client;
};

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface UploadResponse {
  document_id: string;
  is_new: boolean;
  message: string;
}

export interface ProcessingResponse {
  result: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

// Health check
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

// Admin endpoints
export const adminIngestFile = async (
  token: string,
  file: File,
  uploaderId?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (uploaderId) {
    formData.append('uploader_id', uploaderId);
  }
  
  const client = createAdminClient(token);
  const response = await client.post<UploadResponse>('/admin/ingest-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const adminIngestText = async (
  token: string,
  text: string,
  uploaderId?: string
): Promise<UploadResponse> => {
  const client = createAdminClient(token);
  const response = await client.post<UploadResponse>('/admin/ingest-text', {
    text,
    uploader_id: uploaderId,
  });
  return response.data;
};

// User endpoints
export const userUploadFile = async (
  file: File,
  userId?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) {
    formData.append('user_id', userId);
  }
  
  const response = await apiClient.post<UploadResponse>('/user/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const userUploadText = async (
  text: string,
  userId?: string
): Promise<UploadResponse> => {
  const response = await apiClient.post<UploadResponse>('/user/upload-text', {
    text,
    user_id: userId,
  });
  return response.data;
};

// Processing endpoints
export const simplifyDocument = async (
  documentId: string,
  outputLanguage: string = 'English'
): Promise<ProcessingResponse> => {
  const response = await apiClient.post<ProcessingResponse>('/simplify', {
    document_id: documentId,
    output_language: outputLanguage,
  });
  return response.data;
};

export const summarizeDocument = async (
  documentId: string,
  outputLanguage: string = 'English'
): Promise<ProcessingResponse> => {
  const response = await apiClient.post<ProcessingResponse>('/summary', {
    document_id: documentId,
    output_language: outputLanguage,
  });
  return response.data;
};

export const extractKeyTerms = async (
  documentId: string,
  outputLanguage: string = 'English'
): Promise<ProcessingResponse> => {
  const response = await apiClient.post<ProcessingResponse>('/keyterms', {
    document_id: documentId,
    output_language: outputLanguage,
  });
  return response.data;
};

export const analyzeRisks = async (
  documentId: string,
  outputLanguage: string = 'English'
): Promise<ProcessingResponse> => {
  const response = await apiClient.post<ProcessingResponse>('/risk-analysis', {
    document_id: documentId,
    output_language: outputLanguage,
  });
  return response.data;
};

export const compareContracts = async (
  documentId1: string,
  documentId2: string,
  outputLanguage: string = 'English'
): Promise<ProcessingResponse> => {
  const response = await apiClient.post<ProcessingResponse>('/contract-comparison', {
    document_id_1: documentId1,
    document_id_2: documentId2,
    output_language: outputLanguage,
  });
  return response.data;
};

// Error handling helper
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default apiClient;
