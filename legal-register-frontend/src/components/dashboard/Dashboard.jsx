import { useState, useEffect } from 'react';
import legalRegisterService from '../../services/legalRegisterService';
import Loader from '../common/Loader';
import { getDaysUntilRenewal, getRenewalUrgencyBadge, formatDate } from '../../utils/dateHelpers';
import logger from '../../utils/logger';
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
      logger.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const statCards = [
    {
      label: 'Total Permits',
      value: stats?.total || 0,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      textColor: 'text-blue-700',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Active',
      value: stats?.active || 0,
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      textColor: 'text-emerald-700',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: 'Expiring Soon',
      value: stats?.expiringSoon || 0,
      gradient: 'from-amber-400 to-yellow-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      textColor: 'text-amber-700',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Overdue',
      value: stats?.overdue || 0,
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50',
      border: 'border-red-100',
      textColor: 'text-red-700',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your permits and compliance status</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white overflow-hidden shadow-sm rounded-xl border ${card.border}`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`flex-shrink-0 bg-gradient-to-br ${card.gradient} rounded-xl p-3 shadow-sm`}>
                  {card.icon}
                </div>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
          </div>
        ))}
      </div>

      {/* Expiry Alerts */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Renewal Alerts</h2>
          {(alerts?.dueToday?.length || alerts?.dueTwoDays?.length || alerts?.dueWeek?.length || alerts?.expired?.length) ? (
            <span className="text-xs bg-red-100 text-red-700 font-medium px-2.5 py-1 rounded-full">
              {(alerts?.dueToday?.length || 0) + (alerts?.dueTwoDays?.length || 0) + (alerts?.dueWeek?.length || 0) + (alerts?.expired?.length || 0)} items need attention
            </span>
          ) : null}
        </div>

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
                      <p className="text-sm text-gray-600">Document No: {item.documentNo}</p>
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
                      <p className="text-sm text-gray-600">Document No: {item.documentNo}</p>
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
                        <p className="text-sm text-gray-600">Document No: {item.documentNo}</p>
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
                        <p className="text-sm text-gray-600">Document No: {item.documentNo}</p>
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
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">All permits are up to date</p>
              <p className="text-sm text-gray-400 mt-1">No renewal alerts at the moment</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
