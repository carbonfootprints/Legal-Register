import { useState, useEffect } from 'react';
import legalRegisterService from '../../services/legalRegisterService';
import exportService from '../../services/exportService';
import Loader from '../common/Loader';
import { formatDate, getStatusBadgeClass } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiArchive } from 'react-icons/fi';

const ArchivedPermits = () => {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArchivedRegisters();
  }, [searchTerm]);

  const fetchArchivedRegisters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;

      const response = await legalRegisterService.getArchived(params);
      if (response.success) {
        setRegisters(response.data);
      }
    } catch (error) {
      console.error('Error fetching archived registers:', error);
      toast.error('Failed to load archived permits');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportService.exportToExcel({ search: searchTerm, archived: true });
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportService.exportToPDF({ search: searchTerm, archived: true });
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
        <div className="flex items-center">
          <FiArchive className="h-8 w-8 text-gray-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archived Permits</h1>
            <p className="text-sm text-gray-500 mt-1">Expired permits that have been automatically archived</p>
          </div>
        </div>
      </div>

      {/* Search and Export */}
      <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <input
          type="text"
          placeholder="Search archived permits..."
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
            <FiArchive className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-4">No archived permits found</p>
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
