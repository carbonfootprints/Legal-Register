import { useState, useEffect } from 'react';
import legalRegisterService from '../../services/legalRegisterService';
import exportService from '../../services/exportService';
import Loader from '../common/Loader';
import { formatDate, getStatusBadgeClass } from '../../utils/dateHelpers';
import logger from '../../utils/logger';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiArchive, FiSearch, FiRefreshCw } from 'react-icons/fi';

const ArchivedPermits = () => {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchArchivedRegisters();
  }, [debouncedSearch]);

  const fetchArchivedRegisters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await legalRegisterService.getArchived(params);
      if (response.success) {
        setRegisters(response.data);
      }
    } catch (error) {
      logger.error('Error fetching archived registers:', error);
      toast.error('Failed to load archived permits');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      await legalRegisterService.restore(id);
      toast.success('Permit restored to Active successfully');
      fetchArchivedRegisters();
    } catch (error) {
      logger.error('Error restoring register:', error);
      toast.error('Failed to restore permit');
    } finally {
      setRestoringId(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportService.exportToExcel({ search: debouncedSearch, archived: true });
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      logger.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportService.exportToPDF({ search: debouncedSearch, archived: true });
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      logger.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Archived Permits</h1>
        <p className="text-sm text-gray-500 mt-1">Expired permits that have been automatically archived</p>
      </div>

      {/* Search and Export */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 justify-between items-center">
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search archived permits..."
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
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{registers.length}</span> archived {registers.length === 1 ? 'permit' : 'permits'}
            </span>
          </div>
        )}
        {loading ? (
          <Loader />
        ) : registers.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiArchive className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No archived permits found</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archived At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registers.map((register) => (
                  <tr key={register._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{register.slNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{register.permit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{register.documentNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{register.issuingAuthority}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(register.dateOfIssue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(register.dateOfExpiry)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(register.archivedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(register.status)}`}>
                        {register.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRestore(register._id)}
                        disabled={restoringId === register._id}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        title="Restore to Active"
                      >
                        <FiRefreshCw className={`mr-1.5 h-3.5 w-3.5 ${restoringId === register._id ? 'animate-spin' : ''}`} />
                        {restoringId === register._id ? 'Restoring...' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedPermits;
