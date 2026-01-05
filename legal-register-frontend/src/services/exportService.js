import api from './api';

const exportService = {
  // Export to Excel
  exportToExcel: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await api.get(`/export/excel?${queryString}`, {
        responseType: 'blob', // Important for file download
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `legal-register-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  },

  // Export to PDF
  exportToPDF: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await api.get(`/export/pdf?${queryString}`, {
        responseType: 'blob', // Important for file download
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `legal-register-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  },
};

export default exportService;
