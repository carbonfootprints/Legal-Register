import api from './api';

const uploadService = {
  // Upload single file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload permit document and compliance report together
  uploadDocuments: async (permitDocument, complianceReport) => {
    const formData = new FormData();

    if (permitDocument) {
      formData.append('permitDocument', permitDocument);
    }

    if (complianceReport) {
      formData.append('complianceReport', complianceReport);
    }

    const response = await api.post('/upload/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a file
  deleteFile: async (filename) => {
    const response = await api.delete(`/upload/${filename}`);
    return response.data;
  },

  // Get full URL for a file
  getFileUrl: (filePath) => {
    if (!filePath) return null;

    // If it's already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // Otherwise, prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${filePath}`;
  }
};

export default uploadService;
