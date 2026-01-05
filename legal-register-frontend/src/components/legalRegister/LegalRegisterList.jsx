import { useState, useEffect } from 'react';
import legalRegisterService from '../../services/legalRegisterService';
import exportService from '../../services/exportService';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { formatDate, getStatusBadgeClass, getDaysUntilRenewal, getRenewalUrgencyBadge } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiFileText } from 'react-icons/fi';

const LegalRegisterList = () => {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    permit: '',
    authorizationNo: '',
    issuingAuthority: '',
    dateOfApplication: '',
    dateOfIssue: '',
    dateOfExpiry: '',
    dueDateForRenewal: '',
    reportingFrequency: 'N/A',
    dateOfLastReport: '',
    responsibility: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchRegisters();
  }, [searchTerm]);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;

      const response = await legalRegisterService.getAll(params);
      if (response.success) {
        setRegisters(response.data);
      }
    } catch (error) {
      console.error('Error fetching registers:', error);
      toast.error('Failed to load legal registers');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert ISO date to YYYY-MM-DD format
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        permit: item.permit,
        authorizationNo: item.authorizationNo,
        issuingAuthority: item.issuingAuthority,
        dateOfApplication: formatDateForInput(item.dateOfApplication),
        dateOfIssue: formatDateForInput(item.dateOfIssue),
        dateOfExpiry: formatDateForInput(item.dateOfExpiry),
        dueDateForRenewal: formatDateForInput(item.dueDateForRenewal),
        reportingFrequency: item.reportingFrequency || 'N/A',
        dateOfLastReport: formatDateForInput(item.dateOfLastReport),
        responsibility: item.responsibility,
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        permit: '',
        authorizationNo: '',
        issuingAuthority: '',
        dateOfApplication: '',
        dateOfIssue: '',
        dateOfExpiry: '',
        dueDateForRenewal: '',
        reportingFrequency: 'N/A',
        dateOfLastReport: '',
        responsibility: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with data:', formData);
    setSubmitting(true);

    try {
      // Convert empty strings to null for optional date fields
      const submitData = {
        ...formData,
        dateOfExpiry: formData.dateOfExpiry || null,
        dueDateForRenewal: formData.dueDateForRenewal || null,
        dateOfLastReport: formData.dateOfLastReport || null,
      };

      console.log('Submitting data to backend:', submitData);

      if (editingItem) {
        const response = await legalRegisterService.update(editingItem._id, submitData);
        console.log('Update response:', response);
        toast.success('Legal register updated successfully');
      } else {
        const response = await legalRegisterService.create(submitData);
        console.log('Create response:', response);
        toast.success('Legal register created successfully');
      }
      handleCloseModal();
      fetchRegisters();
    } catch (error) {
      console.error('Error saving register:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save legal register');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await legalRegisterService.delete(id);
        toast.success('Legal register deleted successfully');
        fetchRegisters();
      } catch (error) {
        console.error('Error deleting register:', error);
        toast.error('Failed to delete legal register');
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportService.exportToExcel({ search: searchTerm });
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportService.exportToPDF({ search: searchTerm });
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Legal Registers</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New
        </button>
      </div>

      {/* Search and Export */}
      <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by permit, auth no., or issuing authority..."
          className="border border-gray-300 rounded-md px-4 py-2 w-96"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiDownload className="mr-2" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiFileText className="mr-2" />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <Loader />
        ) : registers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No legal registers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issuing Authority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registers.map((register) => {
                  const days = getDaysUntilRenewal(register.dueDateForRenewal);
                  const urgencyBadge = getRenewalUrgencyBadge(days);
                  return (
                    <tr key={register._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{register.slNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{register.permit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{register.authorizationNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{register.issuingAuthority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(register.dueDateForRenewal)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${urgencyBadge.class}`}>
                          {urgencyBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(register.status)}`}>
                          {register.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(register)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(register._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Legal Register' : 'Add New Legal Register'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Permit *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.permit}
                onChange={(e) => setFormData({ ...formData, permit: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Authorization No. *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.authorizationNo}
                onChange={(e) => setFormData({ ...formData, authorizationNo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Responsibility *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.responsibility}
                onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Issuing Authority *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Application *</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dateOfApplication}
                onChange={(e) => setFormData({ ...formData, dateOfApplication: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Issue *</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dateOfIssue}
                onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Expiry</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dateOfExpiry}
                onChange={(e) => setFormData({ ...formData, dateOfExpiry: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date for Renewal</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dueDateForRenewal}
                onChange={(e) => setFormData({ ...formData, dueDateForRenewal: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Frequency</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.reportingFrequency}
                onChange={(e) => setFormData({ ...formData, reportingFrequency: e.target.value })}
              >
                <option value="N/A">N/A</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly once">Yearly once</option>
                <option value="Two years">Two years</option>
                <option value="Three years once">Three years once</option>
                <option value="Four years">Four years</option>
                <option value="Five years">Five years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last Report</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dateOfLastReport}
                onChange={(e) => setFormData({ ...formData, dateOfLastReport: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending Renewal">Pending Renewal</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingItem ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingItem ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LegalRegisterList;
