import { useState, useEffect } from 'react';
import legalRegisterService from '../../services/legalRegisterService';
import Loader from '../common/Loader';
import { getDaysUntilRenewal, getRenewalUrgencyBadge, formatDate } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, alertsResponse] = await Promise.all([
        legalRegisterService.getStatistics(),
        legalRegisterService.getExpiryAlerts(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (alertsResponse.success) {
        setAlerts(alertsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Permits</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.active || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expiring Soon</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.expiringSoon || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.overdue || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Alerts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Renewal Alerts</h2>

        {/* Due Today */}
        {alerts?.dueToday && alerts.dueToday.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-red-700 mb-3 flex items-center">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm mr-2">
                Due Today
              </span>
              ({alerts.dueToday.length})
            </h3>
            <div className="space-y-2">
              {alerts.dueToday.map((item) => (
                <div key={item._id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.permit}</p>
                      <p className="text-sm text-gray-600">Auth No: {item.authorizationNo}</p>
                    </div>
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                      {formatDate(item.dueDateForRenewal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due in 2 Days */}
        {alerts?.dueTwoDays && alerts.dueTwoDays.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-orange-700 mb-3 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm mr-2">
                Due in 2 Days
              </span>
              ({alerts.dueTwoDays.length})
            </h3>
            <div className="space-y-2">
              {alerts.dueTwoDays.map((item) => (
                <div key={item._id} className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.permit}</p>
                      <p className="text-sm text-gray-600">Auth No: {item.authorizationNo}</p>
                    </div>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                      {formatDate(item.dueDateForRenewal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due This Week */}
        {alerts?.dueWeek && alerts.dueWeek.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-yellow-700 mb-3 flex items-center">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm mr-2">
                Due This Week
              </span>
              ({alerts.dueWeek.length})
            </h3>
            <div className="space-y-2">
              {alerts.dueWeek.map((item) => {
                const days = getDaysUntilRenewal(item.dueDateForRenewal);
                return (
                  <div key={item._id} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.permit}</p>
                        <p className="text-sm text-gray-600">Auth No: {item.authorizationNo}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded block mb-1">
                          {formatDate(item.dueDateForRenewal)}
                        </span>
                        <span className="text-xs text-gray-600">{days} days</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expired */}
        {alerts?.expired && alerts.expired.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm mr-2">
                Expired
              </span>
              ({alerts.expired.length})
            </h3>
            <div className="space-y-2">
              {alerts.expired.map((item) => {
                const days = Math.abs(getDaysUntilRenewal(item.dueDateForRenewal));
                return (
                  <div key={item._id} className="border-l-4 border-gray-500 bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.permit}</p>
                        <p className="text-sm text-gray-600">Auth No: {item.authorizationNo}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded block mb-1">
                          {formatDate(item.dueDateForRenewal)}
                        </span>
                        <span className="text-xs text-red-600">{days} days overdue</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!alerts?.dueToday?.length &&
          !alerts?.dueTwoDays?.length &&
          !alerts?.dueWeek?.length &&
          !alerts?.expired?.length && (
            <p className="text-gray-500 text-center py-8">No renewal alerts at the moment</p>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
