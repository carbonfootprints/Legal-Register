import { useState, useEffect, useRef } from 'react';
import legalRegisterService from '../../services/legalRegisterService';
import exportService from '../../services/exportService';
import uploadService from '../../services/uploadService';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { formatDate, getStatusBadgeClass, getDaysUntilRenewal, getRenewalUrgencyBadge } from '../../utils/dateHelpers';
import logger from '../../utils/logger';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiFileText, FiUpload, FiX, FiSearch, FiCheck } from 'react-icons/fi';

const inputClass = 'mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors';
const dateInputClass = 'w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors';

const LegalRegisterList = () => {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [permitDocumentFile, setPermitDocumentFile] = useState(null);
  const [complianceReportFile, setComplianceReportFile] = useState(null);
  const permitDocumentRef = useRef(null);
  const complianceReportRef = useRef(null);
  const [formData, setFormData] = useState({
    permit: '',
    documentNo: '',
    issuingAuthority: '',
    dateOfIssue: '',
    noExpiry: false,
    dateOfExpiry: '',
    dueDateForRenewal: '',
    reportingFrequency: 'N/A',
    dateOfLastReport: '',
    responsibility: '',
    status: 'Active',
    permitDocument: '',
    complianceReport: ''
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchRegisters();
  }, [debouncedSearch]);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await legalRegisterService.getAll(params);
      if (response.success) {
        setRegisters(response.data);
      }
    } catch (error) {
      logger.error('Error fetching registers:', error);
      toast.error('Failed to load legal registers');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenModal = (item = null) => {
    setPermitDocumentFile(null);
    setComplianceReportFile(null);

    if (item) {
      setEditingItem(item);
      setFormData({
        permit: item.permit,
        documentNo: item.documentNo,
        issuingAuthority: item.issuingAuthority,
        dateOfIssue: formatDateForInput(item.dateOfIssue),
        noExpiry: item.noExpiry || false,
        dateOfExpiry: formatDateForInput(item.dateOfExpiry),
        dueDateForRenewal: formatDateForInput(item.dueDateForRenewal),
        reportingFrequency: item.reportingFrequency || 'N/A',
        dateOfLastReport: formatDateForInput(item.dateOfLastReport),
        responsibility: item.responsibility,
        status: item.status,
        permitDocument: item.permitDocument || '',
        complianceReport: item.complianceReport || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        permit: '',
        documentNo: '',
        issuingAuthority: '',
        dateOfIssue: '',
        noExpiry: false,
        dateOfExpiry: '',
        dueDateForRenewal: '',
        reportingFrequency: 'N/A',
        dateOfLastReport: '',
        responsibility: '',
        status: 'Active',
        permitDocument: '',
        complianceReport: ''
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

    logger.log('Form submitted with data:', formData);
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        dateOfExpiry: formData.noExpiry ? null : (formData.dateOfExpiry || null),
        dueDateForRenewal: formData.noExpiry ? null : (formData.dueDateForRenewal || null),
        dateOfLastReport: formData.dateOfLastReport || null,
      };

      if (permitDocumentFile || complianceReportFile) {
        try {
          const uploadResponse = await uploadService.uploadDocuments(
            permitDocumentFile,
            complianceReportFile
          );

          if (uploadResponse.data.permitDocument) {
            submitData.permitDocument = uploadResponse.data.permitDocument;
          }
          if (uploadResponse.data.complianceReport) {
            submitData.complianceReport = uploadResponse.data.complianceReport;
          }
        } catch (uploadError) {
          logger.error('Error uploading files:', uploadError);
          toast.error('Failed to upload files');
          setSubmitting(false);
          return;
        }
      }

      logger.log('Submitting data to backend:', submitData);

      if (editingItem) {
        await legalRegisterService.update(editingItem._id, submitData);
        toast.success('Legal register updated successfully');
      } else {
        await legalRegisterService.create(submitData);
        toast.success('Legal register created successfully');
      }
      handleCloseModal();
      fetchRegisters();
    } catch (error) {
      logger.error('Error saving register:', error);
      toast.error(error.response?.data?.message || 'Failed to save legal register');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await legalRegisterService.delete(id);
      toast.success('Legal register deleted successfully');
      setDeletingId(null);
      fetchRegisters();
    } catch (error) {
      logger.error('Error deleting register:', error);
      toast.error('Failed to delete legal register');
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportService.exportToExcel({ search: debouncedSearch });
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      logger.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportService.exportToPDF({ search: debouncedSearch });
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      logger.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Register</h1>
          <p className="text-sm text-gray-500 mt-1">Manage permits and compliance documents</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm transition-colors"
        >
          <FiPlus className="mr-1.5 h-4 w-4" />
          Add New
        </button>
      </div>

      {/* Search and Export */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 justify-between items-center">
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by permit, document no., or issuing authority..."
            className="border border-gray-300 rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
          >
            <FiDownload className="mr-1.5 h-4 w-4" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
          >
            <FiFileText className="mr-1.5 h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {!loading && registers.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{registers.length}</span> {registers.length === 1 ? 'record' : 'records'}
              {searchTerm && <span> for "<span className="font-medium text-gray-700">{searchTerm}</span>"</span>}
            </span>
          </div>
        )}
        {loading ? (
          <Loader />
        ) : registers.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiFileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No legal registers found</p>
            {searchTerm && <p className="text-sm text-gray-400 mt-1">Try adjusting your search query</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document No.</th>
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
                  const isDeleting = deletingId === register._id;
                  return (
                    <tr key={register._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{register.slNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{register.permit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{register.documentNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{register.issuingAuthority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {register.noExpiry
                          ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">No Expiry</span>
                          : formatDate(register.dueDateForRenewal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {register.noExpiry
                          ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">No Expiry</span>
                          : <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${urgencyBadge.class}`}>{urgencyBadge.label}</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(register.status)}`}>
                          {register.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isDeleting ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 mr-1">Delete?</span>
                            <button
                              onClick={() => handleDeleteConfirm(register._id)}
                              className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Confirm delete"
                            >
                              <FiCheck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              title="Cancel"
                            >
                              <FiX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenModal(register)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(register._id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
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
                className={inputClass}
                value={formData.permit}
                onChange={(e) => setFormData({ ...formData, permit: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Document No. *</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.documentNo}
                onChange={(e) => setFormData({ ...formData, documentNo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Responsibility *</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.responsibility}
                onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Issuing Authority *</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Issue *</label>
              <input
                type="date"
                required
                className={dateInputClass}
                value={formData.dateOfIssue}
                onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className={inputClass}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending Renewal">Pending Renewal</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Date of Expiry</label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.noExpiry}
                    onChange={(e) => setFormData({
                      ...formData,
                      noExpiry: e.target.checked,
                      dateOfExpiry: '',
                      dueDateForRenewal: ''
                    })}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-gray-500 font-medium">No Expiry</span>
                </label>
              </div>
              <input
                type="date"
                className={`${dateInputClass} ${formData.noExpiry ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                value={formData.noExpiry ? '' : formData.dateOfExpiry}
                onChange={(e) => setFormData({ ...formData, dateOfExpiry: e.target.value })}
                disabled={formData.noExpiry}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date for Renewal</label>
              <input
                type="date"
                className={`${dateInputClass} ${formData.noExpiry ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                value={formData.noExpiry ? '' : formData.dueDateForRenewal}
                onChange={(e) => setFormData({ ...formData, dueDateForRenewal: e.target.value })}
                disabled={formData.noExpiry}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Frequency</label>
              <select
                className={dateInputClass}
                value={formData.reportingFrequency}
                onChange={(e) => setFormData({
                  ...formData,
                  reportingFrequency: e.target.value,
                  dateOfLastReport: e.target.value === 'N/A' ? '' : formData.dateOfLastReport
                })}
              >
                <option value="N/A">N/A</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annually">Annually</option>
                <option value="Once in two years">Once in two years</option>
                <option value="Once in three years">Once in three years</option>
                <option value="Once in four years">Once in four years</option>
                <option value="Once in five years">Once in five years</option>
                <option value="As Required">As Required</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of last report</label>
              <input
                type="date"
                className={`${dateInputClass} ${formData.reportingFrequency === 'N/A' ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                value={formData.reportingFrequency === 'N/A' ? '' : formData.dateOfLastReport}
                onChange={(e) => setFormData({ ...formData, dateOfLastReport: e.target.value })}
                disabled={formData.reportingFrequency === 'N/A'}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Permit Document (Scanned Copy)</label>
              <div className="mt-1">
                <input
                  type="file"
                  ref={permitDocumentRef}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setPermitDocumentFile(file);
                  }}
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => permitDocumentRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  >
                    <FiUpload className="mr-2" />
                    Choose File
                  </button>
                  <span className="text-sm text-gray-500">
                    {permitDocumentFile ? permitDocumentFile.name : (formData.permitDocument ? 'Existing file uploaded' : 'No file chosen')}
                  </span>
                  {(permitDocumentFile || formData.permitDocument) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPermitDocumentFile(null);
                        setFormData({ ...formData, permitDocument: '' });
                        if (permitDocumentRef.current) permitDocumentRef.current.value = '';
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove file"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                {formData.permitDocument && !permitDocumentFile && (
                  <a
                    href={uploadService.getFileUrl(formData.permitDocument)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View current document
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPEG, PNG, DOC, DOCX (Max 10MB)</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Report</label>
              <div className="mt-1">
                <input
                  type="file"
                  ref={complianceReportRef}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setComplianceReportFile(file);
                  }}
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => complianceReportRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  >
                    <FiUpload className="mr-2" />
                    Choose File
                  </button>
                  <span className="text-sm text-gray-500">
                    {complianceReportFile ? complianceReportFile.name : (formData.complianceReport ? 'Existing file uploaded' : 'No file chosen')}
                  </span>
                  {(complianceReportFile || formData.complianceReport) && (
                    <button
                      type="button"
                      onClick={() => {
                        setComplianceReportFile(null);
                        setFormData({ ...formData, complianceReport: '' });
                        if (complianceReportRef.current) complianceReportRef.current.value = '';
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove file"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                {formData.complianceReport && !complianceReportFile && (
                  <a
                    href={uploadService.getFileUrl(formData.complianceReport)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View current document
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPEG, PNG, DOC, DOCX (Max 10MB)</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
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
